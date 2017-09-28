const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /laboratory Listar laboratorios
 *  @apiVersion 1.0.0
 *  @apiName GetLaboratorys
 *  @apiGroup Laboratory
 *
 *  @apiDescription Respuesta: \
 - Lista de laboratorios. \
 - Empezando por la posicion = start. \
 - Tamaño = size.

 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/laboratory?start=10&size=20
 *
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiSuccess {Number} id laboratory-id
 *  @apiSuccess {String} nombre laboratory-name
 *
 *  @apiSampleRequest /laboratory?start=:start&size=:size
 */
router.get('/', function (req, res) {
    var start = parseInt(req.query.start, 10) || 0;
    start = Math.max(start, 0);

    var size = parseInt(req.query.size, 10) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);

    res.set({'Content-Type': 'application/json'});

    var key = req.baseUrl + '?start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql = 'select * from LABORATORIO limit ?, ?';
    dbConn.query(sql, [start, size], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        memCache.put(key, rows, TIME_CACHE);
        res.status(200).send(rows);
    });
});

/**
 *  @api {get} /laboratory/:id Mostrar un laboratorio
 *  @apiVersion 1.0.0
 *  @apiName GetLaboratory
 *  @apiGroup Laboratory
 *
 *  @apiParam {Number} id laboratory-id
 *
 *  @apiDescription Respuesta : \
 - Laboratorio cuyo id es el ingresado.
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/laboratory/1339
 *
 *  @apiSuccess {Number} id laboratory-id
 *  @apiSuccess {String} nombre laboratory-name
 *
 *  @apiError (Error 404) resM404 El <code>id</code> del laboratorio no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /laboratory/:id
 */
router.get('/:id', function (req, res) {
    res.set({'Content-Type': 'application/json'});

    var valor = req.params.id;

    var key = req.baseUrl + '/' + valor;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql = 'select * from LABORATORIO where id = ?';
    dbConn.query(sql, [valor], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (rows.length == 0) {
            res.status(404).send(resM(404));
            return;
        }

        memCache.put(key, rows, TIME_CACHE);
        res.status(200).send(rows);
    });
});

/**
 *  @apiIgnore Not finished Method
 * This method create a new resource
 * Response status code: [201]
 */
router.post('/', function (req, res, next) {
    res.status(405).send(resM(405));
});

/**
 *  @apiIgnore Not finished Method
 * This method create a new resource with id=id
 * Response status code: [404, 409]
 */
router.post('/:id', function (req, res, next) {
    res.status(405).send(resM(405));
});

/**
 *  @apiIgnore Not finished Method
 * This method replace the resource with id=id
 * Response status code: [200, 204, 404]
 */
router.put('/:id', function (req, res, next) {
    res.status(405).send(resM(405));
});

/**
 *  @apiIgnore Not finished Method
 * This method update the resource with id=id
 * Response status code: [200, 204, 404]
 */
router.patch('/:id', function (req, res, next) {
    res.status(405).send(resM(405));
});

/**
 *  @apiIgnore Not finished Method
 * This method delete the resource with id=id
 * Response status code: [200, 404]
 */
router.delete('/:id', function (req, res, next) {
    res.status(405).send(resM(405));
});

/**
 *  @api {get} /laboratory/:id/products Listar productos de un laboratorio
 *  @apiVersion 1.0.0
 *  @apiName GetProductsFromLaboratory
 *  @apiGroup Laboratory
 *
 *  @apiParam {Number} id laboratory-id
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiDescription Respuesta: \
 - Lista de productos que pertenecen al laboratorio cuyo id es el ingresado.\
 - Empezando por la posicion = start.\
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/laboratory/1339/products?start=1&size=2
 *
 *  @apiSuccess {Number} id product-id
 *  @apiSuccess {String} nombre product-name
 *  @apiSuccess {String} concent concentracion del producto
 *  @apiSuccess {Object} tp_pre TIPO_PRESENTACION information
 *  @apiSuccess {Number} tp_pre.id tp-id
 *  @apiSuccess {String} tp_pre.descripcion tp-descripcion
 *  @apiSuccess {Object} tp_pre_si TIPO_PRESENTACION simple information
 *  @apiSuccess {Number} tp_pre_si.id tp2-id
 *  @apiSuccess {String} tp_pre_si.descripcion tp2-descripcion
 *  @apiSuccess {Number} fracciones fracciones
 *  @apiSuccess {Object} reg_san REG_SAN information
 *  @apiSuccess {Number} reg_san.id registro sanitario - id
 *  @apiSuccess {String} reg_san.codigo registro sanitario - codigo
 *  @apiSuccess {Datetime} reg_san.vencimiento registro sanitario - vencimiento
 *  @apiSuccess {Object} laboratorio LABORATORIO information
 *  @apiSuccess {Number} laboratorio.id laboratory-id
 *  @apiSuccess {String} laboratorio.nombre laboratory-name
 *  @apiSuccess {Object} presentacion PRESENTACION information
 *  @apiSuccess {Number} presentacion.id presentacion-id
 *  @apiSuccess {String} presentacion.descripcion presentacion-descripcion
 *  @apiSuccess {Char} estado estado en el que se encuentra
 *
 *  @apiError (Error 404) resM404 El <code>id</code> del laboratorio no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /laboratory/:id/products?start=:start&size=:size
 */
router.get('/:id/products', function (req, res) {
    var start = parseInt(req.query.start, 10) || 0;
    start = Math.max(start, 0);

    var size = parseInt(req.query.size, 10) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);

    res.set({'Content-Type': 'application/json'});
    var idLab = req.params.id;

    var key = req.baseUrl + '/' + idLab + '/products' + '?start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql1 = 'select nombre from LABORATORIO where id = ?';

    dbConn.query(sql1, [idLab], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (rows.length == 0) {
            res.status(404).send(resM(404));
            return;
        }

        var sql2 =
            'select pro.id as idP,pro.nombre as nombreP,pro.concent,' +
            'tp.id as idTP,tp.descripcion as desTP,tp2.id as idTP2,' +
            'tp2.descripcion as desTP2,pro.fracciones,' +
            'reg.id as idREG,reg.codigo,reg.vencimiento,' +
            'lab.id as idLAB,lab.nombre as nombreLAB,pre.id as idPRE,' +
            'pre.descripcion as desPRE,pro.estado ' +
            'from PRODUCTO as pro ' +
            'join REG_SAN as reg on reg.id = pro.reg_san ' +
            'join TIPO_PRESENTACION as tp on tp.id = pro.tp_pre ' +
            'join TIPO_PRESENTACION as tp2 on tp2.id = pro.tp_pre_si ' +
            'join LABORATORIO as lab on lab.id = pro.laboratorio ' +
            'join PRESENTACION as pre on pre.id = pro.presentacion ' +
            'where pro.laboratorio = ?' +
            'limit ?, ?';
        dbConn.query(sql2, [idLab, start, size], function (err, rows) {
            if (err) {
                res.status(500).send(resM(500));
                return;
            }
            if (rows.length == 0) {
                res.status(404).send(resM(404));
                return;
            }

            var ans = [];
            for (var prod in rows) {
                ans.push({
                    id: rows[prod].idP,
                    nombre: rows[prod].nombreP,
                    concentracion: rows[prod].concent,
                    tipo_presentacion: {
                        id: rows[prod].idTP,
                        descripcion: rows[prod].desTP,
                    },
                    tipo_presentacion_simple: {
                        id: rows[prod].idTP2,
                        descripcion: rows[prod].desTP2,
                    },
                    fracciones: rows[prod].fracciones,
                    registro_sanitario: {
                        id: rows[prod].idREG,
                        codigo: rows[prod].codigo,
                        vencimiento: rows[prod].vencimiento,
                    },
                    laboratorio: {
                        id: rows[prod].idLAB,
                        nombre: rows[prod].nombreLAB,
                    },
                    presentacion: {
                        id: rows[prod].idPRE,
                        descripcion: rows[prod].desPRE,
                    },
                    estado: rows[prod].estado,
                });
            }

            memCache.put(key, ans, TIME_CACHE);
            res.status(200).send(ans);
        });
    });
});

module.exports = router;
