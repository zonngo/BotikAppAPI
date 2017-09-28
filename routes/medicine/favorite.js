const express = require('express');
const path = require('path');
const memCache = require('memory-cache');
const router = express.Router();
const https = require('https');

const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));

router.use(function (req, res, next) {
    let session_id = req.cookies.session_id || req.query.session_id || req.body.session_id;
    if (!session_id) {
        res.status(401).send(resM(401, 'No se ha iniciado session.'));
        return;
    }

    let userData = memCache.get(session_id);
    if (userData) {
        req.user_id = userData;
        next();
        return;
    } else if (userData == 'none') {
        res.status(401).send(resM(401, 'No se ha iniciado session.'));
        return;
    }

    https.get('https://accounts.zonngo.com/info/get_id/' + session_id, function (response) {
        if (response.statusCode != 200) {
            res.status(401).send(resM(401, 'No se ha iniciado session.'));
            memCache.put(session_id, 'none', TIME_CACHE);
            return;
        }

        let ans = '';
        response.on('data', function (chunk) {
            ans += chunk;
        });

        response.on('end', function () {
            req.user_id = JSON.parse(ans)['id_user'];
            memCache.put(session_id, req.user_id, TIME_CACHE);
            next();
        });
    }).end();

});


/**
 *  @api {get} /favorite Listar los productos favoritos.
 *  @apiVersion 1.0.0
 *  @apiName GetFavoriteProducts
 *  @apiGroup Favorite
 *
 *  @apiParam {String} [session_id] Id de session de usuario
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiDescription Respuesta: \
 - Listado de productos favoritos de un usuario.\
 - Empezando por la posicion = start.\
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/favorite?start=1&size=2
 *
 *  @apiSuccess {Number} idProducto product-id
 *
 *  @apiError (Error 401) resM401 No se ha iniciado session correctamente.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "No se ha iniciado session.",
 *      code:  401
 *    }
 *
 *  @apiSampleRequest /favorite?session_id=:session_id&start=:start&size=:size
 */

router.get('/', function (req, res) {
    let start = req.query.start || 0;
    if (start < 0) {
        start = 0;
    }

    let size = req.query.size || 10;
    if (size > 100) {
        size = 100;
    } else if (size < 1) {
        size = 1;
    }

    let query = 'SELECT idProducto from FAVORITE WHERE idUser = ?';
    dbConn.query(query, [req.user_id, start, size], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        res.status(200).send(rows);
    });
});


/**
 *  @api {post} /favorite Agregar un favorito
 *  @apiVersion 1.0.0
 *  @apiName NewFavoriteProducts
 *  @apiGroup Favorite
 *
 *  @apiParam {String} [session_id] Opcional
 *  @apiParam {Number} idProducto
 *
 *  @apiDescription Guarda como favorito un Producto. Para lo cual se debe enviar el id del producto\
 *  y el id se session que puede ser enviado por cookie o body.
 *
 *  @apiExample {curl} Example usage:
 *    curl --data "session_id=asfl23hrilsdfha4i&idProducto=1" https://api.botikapp.zonngo.com/v1.0/favorite
 *    curl --data "idProducto=1" --headers "Cookie: session_id=asfl23hrilsdfha4i" https://api.botikapp.zonngo.com/v1.0/favorite
 *
 *  @apiSuccess {Number} idProducto Id del producto
 *
 *  @apiError (Error 401) resM401 No se ha iniciado session correctamente.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "No se ha iniciado session.",
 *      code:  401
 *    }
 *
 *  @apiSampleRequest /favorite
 */

router.post('/', function (req, res) {
    let idProducto = req.body.idProducto;

    if (!idProducto) {
        res.status(400).send(resM(400, 'No se ha encontrado el id de producto.'));
        return;
    }

    let query = 'INSERT INTO FAVORITE(idUser, idProducto) VALUES (?, ?)';
    dbConn.query(query, [req.user_id, idProducto], function (err, rows) {
        if (err) {
            if (err.code == 'ER_DUP_ENTRY') {
                res.status(409).send(resM(409, 'El producto ya existe en favoritos.'));
            } else {
                res.status(500).send(resM(500));
            }
            return;
        }

        res.status(200).send(resM(200));
    });
});


/**
 *  @api {delete} /favorite Eliminar un favorito
 *  @apiVersion 1.0.0
 *  @apiName DeleteFavoriteProducts
 *  @apiGroup Favorite
 *
 *  @apiParam {String} [session_id] Opcional
 *  @apiParam {Number} idProducto
 *
 *  @apiDescription Elimina un producto de favorito. Para lo cual se debe enviar el id del producto \
 *  y el id se session que puede ser enviado por cookie o body.
 *
 *  @apiExample {curl} Example usage:
 *    curl -X DELETE --data "session_id=asfl23hrilsdfha4i&idProducto=1" https://api.botikapp.zonngo.com/v1.0/favorite
 *    curl -X DELETE --data "idProducto=1" --headers "Cookie: session_id=asfl23hrilsdfha4i" https://api.botikapp.zonngo.com/v1.0/favorite
 *
 *  @apiSuccess {Number} idProducto Id del producto
 *
 *  @apiError (Error 401) resM401 No se ha iniciado session correctamente.
 *  @apiError (Error 404) resM404 No se encuentra el producto en la lista de favoritos.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "No se ha iniciado session.",
 *      code:  401
 *    }
 *
 *  @apiSampleRequest /favorite
 */

router.delete('/', function (req, res) {
    let idProducto = req.body.idProducto;

    if (!idProducto) {
        res.status(400).send(resM(400));
        return;
    }

    let query = 'DELETE FROM FAVORITE WHERE idUser = ? and idProducto = ?';
    dbConn.query(query, [req.user_id, idProducto], function (err, result) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send(resM(404, 'Elproducto no esta como favorito.'));
            return;
        }

        res.status(200).send(resM(200));
    });
});


/**
 *  @api {post} /favorite/delete Eliminar un favorito por post
 *  @apiVersion 1.0.0
 *  @apiName DeleteFavoriteProductsPost
 *  @apiGroup Favorite
 *
 *  @apiParam {String} [session_id] Opcional
 *  @apiParam {Number} idProducto
 *
 *  @apiDescription Elimina un producto de favorito. Para lo cual se debe enviar el id del producto \
 *  y el id se session que puede ser enviado por cookie o body.
 *
 *  @apiExample {curl} Example usage:
 *    curl --data "session_id=asfl23hrilsdfha4i&idProducto=1" https://api.botikapp.zonngo.com/v1.0/favorite/delete
 *    curl --data "idProducto=1" --headers "Cookie: session_id=asfl23hrilsdfha4i" https://api.botikapp.zonngo.com/v1.0/favorite/delete
 *
 *  @apiSuccess {Number} idProducto Id del producto
 *
 *  @apiError (Error 401) resM401 No se ha iniciado session correctamente.
 *  @apiError (Error 404) resM404 No se encuentra el producto en la lista de favoritos.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "No se ha iniciado session.",
 *      code:  401
 *    }
 *
 *  @apiSampleRequest /favorite/delete
 */

router.post('/delete', function (req, res) {
    let idProducto = req.body.idProducto;

    if (!idProducto) {
        res.status(400).send(resM(400));
        return;
    }

    let query = 'DELETE FROM FAVORITE WHERE idUser = ? and idProducto = ?';
    dbConn.query(query, [req.user_id, idProducto], function (err, result) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (result.affectedRows == 0) {
            res.status(404).send(resM(404, 'Elproducto no esta como favorito.'));
            return;
        }

        res.status(200).send(resM(200));
    });
});

module.exports = router;