const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /product Listar productos
 *  @apiVersion 1.0.0
 *  @apiName GetProducts
 *  @apiGroup Product
 *
 *  @apiDescription Respuesta: \
 - Lista de productos. \
 - Empezando por la posicion = start. \
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/product?start=0&size=1
 *
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
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
 *  @apiSampleRequest /product?start=:start&size=:size
 */
router.get('/', function (req, res, next) {
    var start = parseInt(req.query.start) || 0;
    start = Math.max(start, 0);

    var size = parseInt(req.query.size) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);

    var key = req.baseUrl + '?start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql =
        'select pro.id as idP,pro.nombre as nombreP,pro.concent,' +
        'tp.id as idTP,tp.descripcion as desTP,tp2.id as idTP2,' +
        'tp2.descripcion as desTP2,pro.fracciones,' +
        'reg.id as idREG,reg.codigo,reg.vencimiento,' +
        'lab.id as idLAB,lab.nombre as nombreLAB,pre.id as idPRE,' +
        'pre.descripcion as desPRE,pro.estado , pro.tipo as tipo ' +
        'from PRODUCTO as pro ' +
        'join REG_SAN as reg on reg.id = pro.reg_san ' +
        'join TIPO_PRESENTACION as tp on tp.id = pro.tp_pre ' +
        'join TIPO_PRESENTACION as tp2 on tp2.id = pro.tp_pre_si ' +
        'join LABORATORIO as lab on lab.id = pro.laboratorio ' +
        'join PRESENTACION as pre on pre.id = pro.presentacion ' +
        'limit ?, ?';
    dbConn.query(sql, [start, size], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        let ans = [];
        for (let prod = 0; prod < rows.length; prod++) {
            ans.push({
                id: rows[prod].idP,
                nombre: rows[prod].nombreP,
                concentracion: rows[prod].concent,
                tipo: rows[prod].tipo,
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

/**
 *  @api {get} /product/:id Mostrar un producto
 *  @apiVersion 1.0.0
 *  @apiName GetProduct
 *  @apiGroup Product
 *
 *  @apiParam {Number} id product-id
 *
 *  @apiDescription Respuesta: \
 - Producto cuyo id es el ingresado.
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/product/28043
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
 *  @apiError (Error 404) resM404 El <code>id</code> del producto no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /product/:id
 */
router.get('/:id', function (req, res, next) {
    var id = req.params.id;

    var key = req.baseUrl + '/' + id;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql =
        'select pro.id as idP,pro.nombre as nombreP,pro.concent,' +
        'tp.id as idTP,tp.descripcion as desTP,tp2.id as idTP2,' +
        'tp2.descripcion as desTP2,pro.fracciones,' +
        'reg.id as idREG,reg.codigo,reg.vencimiento,' +
        'lab.id as idLAB,lab.nombre as nombreLAB,pre.id as idPRE,' +
        'pre.descripcion as desPRE,pro.estado , pro.tipo as tipo ' +
        'from PRODUCTO as pro ' +
        'join REG_SAN as reg on reg.id = pro.reg_san ' +
        'join TIPO_PRESENTACION as tp on tp.id = pro.tp_pre ' +
        'join TIPO_PRESENTACION as tp2 on tp2.id = pro.tp_pre_si ' +
        'join LABORATORIO as lab on lab.id = pro.laboratorio ' +
        'join PRESENTACION as pre on pre.id = pro.presentacion ' +
        'where pro.id = ?';
    dbConn.query(sql, [id], function (err, rows) {
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
                tipo: rows[prod].tipo,
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

module.exports = router;
