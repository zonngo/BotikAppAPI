const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /presentation Listar presentaciones
 *  @apiVersion 1.0.0
 *  @apiName GetPresentations
 *  @apiGroup Presentation
 *
 *  @apiDescription Respuesta: \
 - Lista de presentaciones. \
 - Empezando por la posicion = start. \
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/presentation?start=0&&size=1
 *
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiSuccess {Number} id presentation-id
 *  @apiSuccess {String} descripcion presentation-descripcion
 *
 *  @apiSampleRequest /presentation?start=:start&&size=:size
 */
router.get('/', function (req, res, next) {
    var start = parseInt(req.query.start) || 0;
    start = Math.max(start, 0);

    var size = parseInt(req.query.size) || 10;
    size = Math.max(1, size);
    size = Math.min(size, 100);

    res.set({'Content-Type': 'application/json'});

    var key = req.baseUrl + '?start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var q = 'SELECT * FROM PRESENTACION limit ?, ?';
    dbConn.query(q, [start, size], function (err, data) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        memCache.put(key, data, TIME_CACHE);
        res.status(200).send(data);
    });
});

/**
 *  @api {get} /presentation/:id Mostrar una presentacion
 *  @apiVersion 1.0.0
 *  @apiName GetPresentation
 *  @apiGroup Presentation
 *
 *  @apiParam {Number} id presentation-id
 *
 *  @apiDescription Respuesta: \
 - Presentacion cuyo id es el ingresado.
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/presentation/5309
 *
 *  @apiSuccess {Number} id presentation-id
 *  @apiSuccess {String} descripcion presentation-descripcion
 *
 *  @apiError (Error 404) resM404 El <code>id</code> de la presentacion no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /presentation/:id
 */
router.get('/:id', function (req, res, next) {
    res.set({'Content-Type': 'application/json'});
    var id = req.params.id;

    var key = req.baseUrl + '/' + id;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }

    var q = 'SELECT * FROM PRESENTACION where id = ?';

    dbConn.query(q, [id], function (err, data) {
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
