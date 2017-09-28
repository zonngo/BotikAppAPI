const router = require('express').Router();
const dbConn = require('../../database/medicine');

const resM = require('../../tools/response-manager');
const isAuthenticated = require('../../tools/isAuthenticated');

/**
 *  @api {post} /donations Nueva Donación
 *  @apiVersion 1.0.0
 *  @apiName NewDonation
 *  @apiGroup Donations
 *
 *  @apiDescription Añadir una nueva donación: \
 - La donación tendrá una ubicación \
 - La donación estará vinculada a un id de user \
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/donations
 *
 *  @apiParam {String} medicamento Nombre del medicamento a donar
 *  @apiParam {String} descripcion Breve descripción del medicamento
 *  @apiParam {String} cantidad Cantidad del medicamento a donar
 *  @apiParam {String} lat Latitud para la ubicación del medicamento
 *  @apiParam {String} long Longitud para la ubicación del medicamento
 *
 *  @apiHeaderExample {json} Header-Example:
 *     {
 *       Authorization: 'Bearer {{accessToken}}'
 *     }
 *
 *  @apiSampleRequest /donations
 */
router.post('/', isAuthenticated, function (req, res) {
	if (!req.user) {
		res.status(404).send(resM(404));
		return;
	}
	let user_id = req.user.user_id;
	let medicamento = req.body.medicamento;
	let descripcion = req.body.descripcion;
	let cantidad = req.body.cantidad;
	let lat = req.body.lat;
	let long = req.body.long;

	let sql = "INSERT INTO DONATIONS(medicamento, descripcion, " +
		"cantidad, lat, lng, id_user) VALUES (?,?,?,?,?,?)";
	let cols = [medicamento, descripcion, cantidad, lat, long, user_id];

	dbConn.query(sql, cols, function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send(resM(500));
		}

		res.json({
			"user_id": user_id,
			"medicamento": medicamento,
			"descripcion": descripcion,
			"cantidad": cantidad,
			"lat": lat,
			"long": long
		});
	});
});

/**
 *  @api {put} /donations/:id Editar Donación
 *  @apiVersion 1.0.0
 *  @apiName EditDonation
 *  @apiGroup Donations
 *
 *  @apiDescription Editar una donación: \
 - Debe pertenecer al usuario que la edita \
 - Puede editar campos como ubicación, cantidad y descripción \
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/donations/1
 *
 *  @apiParam {Number} id Identificador de la donacion a modificar
 *  @apiParam {String} medicamento Nombre del medicamento
 *  @apiParam {String} descripcion Descripcion del medicamento
 *  @apiParam {Number} cantidad Cantidad del medicamento
 *  @apiParam {Number} lat Latitud para ubicar la donacion
 *  @apiParam {Number} long Longitud para ubicar la donacion
 *
 *  @apiHeaderExample {json} Header-Example:
 *     {
 *       Authorization: 'Bearer {{accessToken}}'
 *     }
 *
 *  @apiSampleRequest /donations/:id
 */
router.put('/:id', isAuthenticated, function (req, res) {
	if (!req.user) {
		res.status(404).send(resM(404));
		return;
	}
	let med_id = req.params.id
	let user_id = req.user.user_id;
	let medicamento = req.body.medicamento
	let descripcion = req.body.descripcion
	let cantidad = req.body.cantidad
	let lat = req.body.lat
	let long = req.body.long

	let sql = "UPDATE DONATIONS SET medicamento = ?, descripcion = ?, " +
		"cantidad = ?, lat = ?, lng = ? WHERE id = ? AND id_user = ?";
	let cols = [medicamento, descripcion, cantidad, lat, long, med_id, user_id];

	dbConn.query(sql, cols, function (err, result) {
		if (err) {
			console.error(err);
			//throw(err);
			return res.status(500).send(resM(500));
		}
		res.status(200).send(resM(200));
	});
});

/**
 *  @api {delete} /donations/:id Eliminar Donación
 *  @apiVersion 1.0.0
 *  @apiName DeleteDonation
 *  @apiGroup Donations
 *
 *  @apiDescription Eliminar una Donación: \
 - Debe pertenecer al usuario que la elimina \
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/donations/:id
 *
 *  @apiParam {Number} id Identificador de la donacion a eliminar
 *
 *  @apiHeaderExample {json} Header-Example:
 *     {
 *       Authorization: 'Bearer {{accessToken}}'
 *     }
 *
 */
router.delete('/:id', isAuthenticated, function (req, res) {
	if (!req.user) {
		res.status(404).send(resM(404));
		return;
	}
	let med_id = req.params.id
	let user_id = req.user.user_id;
	let sql = "DELETE FROM DONATIONS WHERE id = ? AND id_user = ?";
	let cols = [med_id, user_id];

	dbConn.query(sql, cols, function (err, result) {
		if (err) {
			console.error(err);
			//throw(err);
			return res.status(500).send(resM(500));
		}
		res.status(200).send(resM(200));
	});
});

/**
 *  @api {get} /donations Buscar Donaciones
 *  @apiVersion 1.0.0
 *  @apiName SeekDonation
 *  @apiGroup Donations
 *
 *  @apiDescription Buscar Donaciones: \
 - El filtrado se realiza por medicamento \
 - Tambien se filtra por geolocalización \
 - Si no se especifica el medicamento, ubica todas las donaciones cercanas \
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/donations?lat=37&long=-122&rad=50&med=AMOXICILINA
 *
 *  @apiParam {Number} lat latitud
 *  @apiParam {Number} long longitud
 *  @apiParam {Number} rad radio
 *  @apiParam {String} med medicamento
 *  @apiSampleRequest /donations?lat=:latitud&long=:longitud&rad=:radio&med=:medicina
 */
router.get('/', function (req, res) {
	let lat = req.query.lat || 37;
	let long = req.query.long || -122;
	let rad = parseInt(req.query.rad || 50);
	let med = req.query.med;

	var sql = "SELECT id, medicamento, descripcion, cantidad, id_user, ( 6371 * acos( cos( radians(" + lat + ") ) * cos( radians( lat ) ) " +
		"* cos( radians( lng ) - radians(" + long + ") ) + sin( radians(" + lat + ") ) * sin(radians(lat)) ) ) AS distance " +
		"FROM DONATIONS ";
	if (med) {
		sql = sql + "WHERE medicamento LIKE '" + med + "%' "
	}
	sql = sql + "HAVING distance < " + rad +
		" ORDER BY distance " +
		"LIMIT 0 , 20";

	dbConn.query(sql, [], function (err, rows) {
		if (err) {
			res.status(500).send(resM(500));
			return;
		}
		if (rows.length === 0) {
			res.status(404).send(resM(404));
			return;
		}
		res.status(200).send(rows);
	});
});


module.exports = router;
