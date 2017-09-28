const express = require('express');
const path = require('path');
const memCache = require('memory-cache');

const router = express.Router();
const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));


/**
 *  @api {get} /personal Listar Personal
 *  @apiVersion 1.0.0
 *  @apiName GetPersonals
 *  @apiGroup Personal
 *
 *  @apiDescription Respuesta: \
 - Lista de personal de distintas farmacias \
 - Empezando por la posicion = start. \
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/personal?start=0&size=1
 *
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 * @apiSuccess {Number} idF farmacia-id
 * @apiSuccess {String} nombre nombre del personal
 * @apiSuccess {String} cargo cargo del pesonal
 * @apiSuccess {String} dni dni del personal
 * @apiSuccess {String} horario horario de trabajo del personal
 * @apiSuccess {Number} tipo tipo de rol que cumple en la farmacia
 *
 *  @apiSampleRequest /personal?start=:start&size=:size
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

    var sql = 'select * from PERSONAL limit ?, ?';
    dbConn.query(sql, [start, size], function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        memCache.put(key, rows, TIME_CACHE);
        res.status(200).send(rows);
    });
});

module.exports = router;
