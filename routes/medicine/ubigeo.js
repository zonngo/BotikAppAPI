const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /ubigeo Listar Ubigeos
 *  @apiName GetUbigeos
 *  @apiGroup Ubigeo
 *  @apiVersion 1.0.0
 *
 *  @apiDescription Respuesta: \
 - Lista de ubigeos \
 *  @apiParam {Number} ubigeo ubigeo
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/ubigeo?ubigeo=:ubigeo
 *
 *
 * @apiSuccess {Number} id ubigeo-id
 * @apiSuccess {String} nombre nombre
 * @apiSuccess {String} tipo tipo
 * @apiSuccess {String} parent parent
 *
 *  @apiSampleRequest /ubigeo?ubigeo=:ubigeo
 */
router.get('/', function (req, res, next) {
    var ubigeo = parseInt(req.query.ubigeo || '0');
    var key = req.baseUrl + '?ubigeo=' + ubigeo;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }
    var sql = 'select * from UBIGEO where id = ? ';
    if (ubigeo == 0) {
        dbConn.query('select * from UBIGEO where id < 100', [], function (err, rows) {
            if (err) {
                res.status(500).send(resM(500));
                return;
            }
            memCache.put(key, rows, TIME_CACHE);
            res.status(200).send(rows);
        });
    } else {
        dbConn.query(sql, [ubigeo], function (err, data) {
            if (err) {
                res.status(500).send(resM(500));
                return;
            }
            var a = -1;
            if (data.length == 0) {
                res.status(404).send(resM(404));
                return
            }
            dbConn.query('select * from UBIGEO where parent = ?', [ubigeo], function (err1, rows) {
                if (err1) {
                    res.status(500).send(resM(500));
                    return;
                }
                memCache.put(key, rows, TIME_CACHE);
                res.status(200).send(rows);
            });

        });
    }
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
