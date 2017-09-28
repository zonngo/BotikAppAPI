const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /pharmacy Listar farmacias
 *  @apiVersion 1.0.0
 *  @apiName GetPharmacys
 *  @apiGroup Pharmacy
 *
 *  @apiDescription Respuesta: \
 - Lista de farmacias \
 - Empezando por la posicion = start. \
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/pharmacy?ubigeo=:ubigeo&start=0&size=1
 *  @apiParam {String} ubigeo ubigeo
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 * @apiSuccess {Number} id pharmacy-id
 * @apiSuccess {Char} estado estado del scrap que se empleo
 * @apiSuccess {Char} tipo_est
 * @apiSuccess {String} nombre nombre de la farmacia
 * @apiSuccess {Number} ubigeo
 * @apiSuccess {String} direccion direccion de la farmacia
 * @apiSuccess {String} provincia provincia de la farmacia
 * @apiSuccess {String} telefono numero telefonico
 * @apiSuccess {String} horario horario de atencion
 * @apiSuccess {String} dtecnico director tecnico
 * @apiSuccess {Double} lat latitud
 * @apiSuccess {Double} lng longitud
 * @apiSuccess {String} distrito distrito donde se encuentra la farmacia
 * @apiSuccess {String} departamento departamento donde se encuentra la farmacia
 * @apiSuccess {String} ruc ruc de la farmacia
 * @apiSuccess {String} situacion
 * @apiSuccess {String} categoria categoria: farmacia, botica, ...
 * @apiSuccess {String} razonSocial
 *
 *  @apiSampleRequest /pharmacy?ubigeo=:ubigeo&start=:start&size=:size
 */
router.get('/', function (req, res, next) {
    var start = parseInt(req.query.start) || 0;
    start = Math.max(start, 0);
    var size = parseInt(req.query.size) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);
    ubigeo = req.query.ubigeo || ''
    if (ubigeo.length % 2 == 1) {
        res.status(401).send(resM(401));
        return;
    }
    var key = req.baseUrl + '?ubigeo=' + ubigeo + '&start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }
    var array = [];
    var q = 'select * from FARMACIA ';
    if (ubigeo != '') {
        var len = ubigeo.length;
        q += 'where substr(ubigeo,1, ?) = ? ';
        array.push(len);
        array.push(ubigeo);
        q += " and situacion = 'ACTIVO'";
    } else q += "where situacion = 'ACTIVO'";
    q += " limit ?, ?";
    array.push(start);
    array.push(size);
    dbConn.query(q, array, function (err, data) {
        if (err) {
            console.log(q);
            console.log(array);
            res.status(500).send(resM(500));
            return;
        }

        memCache.put(key, data, TIME_CACHE);
        res.status(200).send(data);
    });
});

/**
 *  @api {get} /pharmacy/:id Mostrar una farmacia
 *  @apiVersion 1.0.0
 *  @apiName GetPharmacy
 *  @apiGroup Pharmacy
 *
 *  @apiParam {Number} id pharmacy-id
 *
 *  @apiDescription Respuesta:
 - Farmacia cuyo id es el ingresado
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/pharmacy/7048
 *
 * @apiSuccess {Number} id pharmacy-id
 * @apiSuccess {Char} estado estado del scrap que se empleo
 * @apiSuccess {Char} tipo_est
 * @apiSuccess {String} nombre nombre de la farmacia
 * @apiSuccess {Number} ubigeo
 * @apiSuccess {String} direccion direccion de la farmacia
 * @apiSuccess {String} provincia provincia de la farmacia
 * @apiSuccess {String} telefono numero telefonico
 * @apiSuccess {String} horario horario de atencion
 * @apiSuccess {String} dtecnico director tecnico
 * @apiSuccess {Double} lat latitud
 * @apiSuccess {Double} lng longitud
 * @apiSuccess {String} distrito distrito donde se encuentra la farmacia
 * @apiSuccess {String} departamento departamento donde se encuentra la farmacia
 * @apiSuccess {String} ruc ruc de la farmacia
 * @apiSuccess {String} situacion
 * @apiSuccess {String} categoria categoria: farmacia, botica, ...
 * @apiSuccess {String} razonSocial
 *
 *  @apiError (Error 404) resM404 El <code>id</code> de la farmacia no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /pharmacy/:id
 */
router.get('/:id', function (req, res, next) {
    res.set({'Content-Type': 'application/json'});

    var valor = req.params.id;

    var key = req.basUrl + '/' + valor;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var q = 'SELECT * FROM FARMACIA where id = ?';

    dbConn.query(q, [valor], function (err, data) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (data.length == 0) {
            res.status(404).send(resM(404));
            return;
        }

        memCache.put(key, data, TIME_CACHE);
        res.status(200).send(data);
    });
});

/**
 *  @api {get} /pharmacy/:id/products Listar productos de una farmacia
 *  @apiVersion 1.0.0
 *  @apiName GetProductsFromPharmacy
 *  @apiGroup Pharmacy
 *
 *  @apiParam {Number} id pharmacy-id
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiDescription Respuesta: \
 - Lista de Productos vendidos en la farmacia cuyo id es el ingresado. \
 - Empezando por la posicion = start. \
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/pharmacy/7048/products?start=0&size=1
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
 *  @apiSuccess {Double} pf.precio precio del producto al cual se esta vendiendo
 *
 *  @apiError (Error 404) resM404 El <code>id</code> de la farmacia no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /pharmacy/:id/products?start=:start&size=:size
 */
router.get('/:id/products', function (req, res, next) {
    var start = parseInt(req.query.start) || 0;
    start = Math.max(start, 0);

    var size = parseInt(req.query.size) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);

    res.set({'Content-Type': 'application/json'});
    var idF = req.params.id;

    var key = req.baseUrl + '/' + idF + '/products' + '?start=' + start + '&size=' + size;
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
        'pre.descripcion as desPRE,pro.estado, pf.precio ' +
        'from PRODUCTO as pro ' +
        'join PROD_FARM as pf on pf.idP = pro.id ' +
        'join REG_SAN as reg on reg.id = pro.reg_san ' +
        'join TIPO_PRESENTACION as tp on tp.id = pro.tp_pre ' +
        'join TIPO_PRESENTACION as tp2 on tp2.id = pro.tp_pre_si ' +
        'join LABORATORIO as lab on lab.id = pro.laboratorio ' +
        'join PRESENTACION as pre on pre.id = pro.presentacion ' +
        'where pf.idF = ? ' +
        'limit ?, ?';
    dbConn.query(sql, [idF, start, size], function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send(resM(500));
            return;
        }

        if (data.length == 0) {
            res.status(404).send(resM(404));
            return;
        }

        memCache.put(key, data, TIME_CACHE);
        res.status(200).send(data);
    });
});

/**
 *  @api {get} /pharmacy/:idF/product/:idP Mostrar un producto de una farmacia
 *  @apiVersion 1.0.0
 *  @apiName GetProductFromPharmacy
 *  @apiGroup Pharmacy
 *
 *  @apiParam {Number} idF pharmacy-id
 *  @apiParam {Number} idP product-id
 *
 *  @apiDescription Respuesta: \
 - Producto (id = idP) que es vendido en la farmacia (id = idF)
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/pharmacy/7048/product/6
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
 *  @apiSuccess {Double} pf.precio precio del producto al cual se esta vendiendo
 *
 *  @apiError (Error 404) PharmacyNotFound El <code>idF</code> de la farmacia no se encuentra en la base de datos de zonngo o no existe.
 *  @apiError (Error 404) ProductNotFound El <code>idP</code> del producto no se encuntra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /pharmacy/:idF/product/:idP
 */
router.get('/:idF/product/:idP', function (req, res, next) {
    res.set({'Content-Type': 'application/json'});
    var idF = req.params.idF, idP = req.params.idP;

    var key = req.baseUrl + '/' + idF + '/product/' + idP;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var q =
        'select pro.id as idP,pro.nombre as nombreP,pro.concent,' +
        'tp.id as idTP,tp.descripcion as desTP,tp2.id as idTP2,' +
        'tp2.descripcion as desTP2,pro.fracciones,' +
        'reg.id as idREG,reg.codigo,reg.vencimiento,' +
        'lab.id as idLAB,lab.nombre as nombreLAB,pre.id as idPRE,' +
        'pre.descripcion as desPRE,pro.estado, pf.precio ' +
        'from PRODUCTO as pro ' +
        'join PROD_FARM as pf on pf.idP = pro.id ' +
        'join REG_SAN as reg on reg.id = pro.reg_san ' +
        'join TIPO_PRESENTACION as tp on tp.id = pro.tp_pre ' +
        'join TIPO_PRESENTACION as tp2 on tp2.id = pro.tp_pre_si ' +
        'join LABORATORIO as lab on lab.id = pro.laboratorio ' +
        'join PRESENTACION as pre on pre.id = pro.presentacion ' +
        'where pf.idF = ? and pf.idP = ? ';

    dbConn.query(q, [idF, idP], function (err, data) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        if (data.length == 0) {
            res.status(404).send(resM(404));
        } else {

            memCache.put(key, data, TIME_CACHE);
            res.status(200).send(data);
        }
    });
});


/**
 *  @api {get} /pharmacy/id/personal Listar Personal de una farmacia
 *  @apiVersion 1.0.0
 *  @apiName GetPersonalsFarm
 *  @apiGroup Pharmacy
 *
 *  @apiDescription Respuesta: \
 - Lista de personal de una farmacia \
 - Tipo : ( 1: Representante Legal, 2: Personal del Establecimiento )
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/pharmacy/7048/personal
 *
 *  @apiParam {Number} id <code>id</code> de la farmacia
 *
 * @apiSuccess {Number} idF farmacia-id
 * @apiSuccess {String} nombre nombre del personal
 * @apiSuccess {String} cargo cargo del pesonal
 * @apiSuccess {String} dni dni del personal
 * @apiSuccess {String} horario horario de trabajo del personal
 * @apiSuccess {Number} tipo tipo de rol que cumple en la farmacia
 *
 *  @apiSampleRequest /pharmacy/:id/personal
 */
router.get('/:id/personal', function (req, res, next) {

    res.set({'Content-Type': 'application/json'});
    var idF = req.params.id;

    var key = req.baseUrl + '/' + idF + '/personal';
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var sql = 'select * from PERSONAL where idF = ?'
    dbConn.query(sql, [idF], function (err, data) {
        if (err) {
            console.log(err);
            res.status(500).send(resM(500));
            return;
        }

        if (data.length == 0) {
            res.status(404).send(resM(404));
            return;
        }

        memCache.put(key, data, TIME_CACHE);
        res.status(200).send(data);
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
