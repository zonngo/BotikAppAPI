const express = require('express');
const path = require('path');
const memCache = require('memory-cache');
const router = express.Router();

const dbConn = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const TIME_CACHE = 60 * 1000;
const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));

/**
 *  @api {get} /search/producto/:id/precioMinimo Mostrar el menor precio de un producto
 *  @apiVersion 1.0.0
 *  @apiName GetMinPriceProduct
 *  @apiGroup Search
 *
 *  @apiParam {Number} id product-id
 *  @apiParam {String} ubigeo
 *
 *  @apiDescription Respuesta: \
 - Precio minimo del producto cuyo id es el ingresado.
 - El codigo ubigeo es un codigo que identifica una region (15 para Lima).
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/search/producto/28043/precioMinimo?ubigeo=1501
 *
 *  @apiSuccess {Number} precio
 *
 *  @apiError (Error 404) resM404 El <code>id</code> del producto no se encuentra en la base de datos de zonngo o no existe.
 *  @apiErrorExample {json} Error-Response:
 *    {
 *      error: "Resource not found.",
 *      code:  404
 *    }
 *
 *  @apiSampleRequest /search/producto/:id/precioMinimo?ubigeo=:ubigeo
 */
router.get('/producto/:id/precioMinimo', function (req, res) {
    let id = parseInt(req.params.id || -1);
    let ubigeo = req.query.ubigeo || '';
    let key = req.baseUrl + '/producto/' + id + '/precioMinimo?ubigeo=' + ubigeo;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }
    let array = [id];
    if (ubigeo.length % 2) {
        res.status(400).send(resM(400));
        return;
    }
    let sql = 'select min(pf.precio) as precio from PROD_FARM as pf join PRODUCTO as p on p.id = pf.idP ' +
        "join FARMACIA as f on f.id = pf.idF where p.situacion = 'Activo' and f.situacion = 'ACTIVO' and p.id = ? ";

    if (ubigeo != '') {
        let len = ubigeo.length;
        sql += 'and substr(f.ubigeo,1,?) = ? ';
        array.push(len);
        array.push(ubigeo);
    }

    dbConn.query(sql, array, function (err, rows) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }
        if (rows.length == 0) {
            res.status(404).send(resM(404));
            return;
        }
        memCache.put(key, rows[0], TIME_CACHE);
        res.status(200).send(rows[0]);
    });
});

/**
 *  @api {get} /search/suggestions?keyword=:keyword Listar sugerencias
 *  @apiVersion 1.0.0
 *  @apiName GetSearchSuggestions
 *  @apiGroup Search
 *
 *  @apiDescription Respuesta: \
 - Lista de sugerencias para una palabra clave \
 - Empezando por la posicion = start.\
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i http://api.zonngo.com/v1.0/search/suggestions?keyword=paracetamol&start=0&size=1
 *
 *  @apiParam {String} keyword palabra clave
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiSuccess {Object} producto product information
 *  @apiSuccess {String} producto.name nombre del producto
 *
 *  @apiSampleRequest /search/suggestions?keyword=:keyword&start=:start&size=:size
 */
router.get('/suggestions', function (req, res) {
    if (req.query.keyword == undefined) {
        res.status(400).send(resM(400));
    } else {
        res.set({'Content-Type': 'application/json'});

        let start = parseInt(req.query.start) || 0;
        start = Math.max(start, 0);

        let size = parseInt(req.query.size) || 10;
        size = Math.max(1, size);
        size = Math.min(size, 100);

        let string = req.query.keyword + '%';
        let q = 'select * from PRODUCTO p ' +
            'where p.nombre like ? ' +
            'limit ?, ?';
        dbConn.query(q, ['%' + string + '%', start, size], function (err, data) {
            if (err) {
                res.status(500).send(resM(500));
                return;
            }
            res.status(200).send(data);
        });
    }
});
///////////////////////////////////////xdxdxdxd
/**
 *  @api {get} /search/suggestions2?keyword=:keyword Listar sugerencias 2
 *  @apiVersion 1.0.0
 *  @apiName GetSearchSuggestions2
 *  @apiGroup Search
 *
 *  @apiDescription Respuesta: \
 - Lista de sugerencias para una palabra clave o gg\
 - Empezando por la posicion = start.\
 - Tamaño = size
 *
 *  @apiExample {curl} Example usage:
 *    curl -i http://api.zonngo.com/v1.0/search/suggestions2?keyword=paracetamol&start=0&size=1
 *
 *  @apiParam {String} keyword palabra clave
 *  @apiParam {Number} [start = 0] Rango: <code>[0, ></code>
 *  @apiParam {Number} [size = 10]
 Rango: <code>[1,100]</code> \
 Si se encuentra fuera del rango obtiene el valor del extremo mas cercano.
 *
 *  @apiSuccess {Object} producto product information
 *  @apiSuccess {String} producto.name nombre del producto
 *
 *  @apiSampleRequest /search/suggestions2?keyword=:keyword&start=:start&size=:size
 */
router.get('/suggestions2', function (req, res) {
    if (req.query.keyword == undefined) {
        res.status(400).send(resM(400));
        return;
    } else if (req.query.keyword.length < 3) {
        res.status(200).send([]);
        return;
    }
    let keyword = req.query.keyword + '%';
    res.set({'Content-Type': 'application/json'});
    let start = parseInt(req.query.start) || 0;
    start = Math.max(start, 0);
    let size = parseInt(req.query.size);
    if (size == undefined) size = 10;
    size = Math.max(size, 1);
    size = Math.min(size, 100);
    let key = req.baseUrl + '/suggestions2?keyword=' + keyword + '&start=' + start + '&size=' + size;
    var cachedData = memCache.get(key);
    if (cachedData) {
        res.status(200).send(cachedData);
        return;
    }
    dbConn.query('select id from PRODUCTO where nombre like ? ', [keyword], function (err0, rows0) {
        if (err0) {
            res.status(500).send(resM(500));
            return;
        }
        let ids = [];
        if (rows0.length == 0) {
            memCache.put(key, [], TIME_CACHE);
            res.status(200).send([]);
            return;
        }
        for (let i = 0; i < rows0.length; i++) ids.push(rows0[i].id);
        let ans = '(' + ids.toString() + ')';
        dbConn.query('select ids from PROD_SUG where idp in ' + ans, [], function (err1, rows1) {
            if (err1) {
                res.status(500).send(resM(500));
                return;
            }
            if (rows1.length == 0) {
                memCache.put(key, [], TIME_CACHE);
                res.status(200).send([]);
                return;
            }
            ids = [];
            for (let i = 0; i < rows1.length; i++) ids.push(rows1[i].ids);
            ids = JSON.stringify(ids);
            ans = '(' + ids.substr(1, ids.length - 2).replace(/"/g, "'") + ')';
            dbConn.query('select idp from PROD_SUG where ids in ' + ans + ' group by idp', [], function (err2, rows2) {
                if (err2) {
                    res.status(500).send(resM(500));
                    return;
                }
                if (rows2.length == 0) {
                    memCache.put(key, [], TIME_CACHE);
                    res.status(200).send([]);
                    return;
                }
                ids = [];
                for (let i = 0; i < rows2.length; i++) ids.push(rows2[i].idp);
                ans = '(' + ids.toString() + ')';
                dbConn.query('select * from PRODUCTO where id in ' + ans + ' limit ? , ?', [start, size], function (err3, rows3) {
                    if (err3) {
                        res.status(500).send(resM(500));
                        return;
                    }
                    memCache.put(key, rows3, TIME_CACHE);
                    res.status(200).send(rows3);
                });
            });
        });
    });
});


/**
 *  @api {get} /search/pharmacies?product=:product&lat=:lat&lng=:long&radius=:radius Listar farmacias
 *  @apiVersion 1.0.0
 *  @apiName GetSearchPharmacy
 *  @apiGroup Search
 *
 *  @apiDescription Respuesta: \
 - Lista de farmacias que tiene un producto especifico. \
 - Busqueda de farmacias alrededor de una coordenada.
 *
 *  @apiExample {curl} Example usage:
 *    curl -i https://api.botikapp.zonngo.com/v1.0/search/pharmacies?product=243&lat=-12.163&lng=-76.946&radius=12
 *
 *  @apiParam {Number} product Producto a buscar
 *  @apiParam {Double} lat Latitud
 *  @apiParam {Double} lng Longitud
 *  @apiParam {Double} radius Radio
 *
 *  @apiSuccess {Number} id laboratory-id
 *  @apiSuccess {Double} lat Latitud
 *  @apiSuccess {Double} lng Longitud
 *  @apiSuccess {Double} distance Distancia
 *
 *  @apiSampleRequest /search/pharmacies?product=:product&lat=:lat&lng=:lng&radius=:radius
 */
router.get('/pharmacies', function (req, res) {
    let product = parseInt(req.query.product) || 500000;
    let lat = parseFloat(req.query.lat) || -12.045909;
    let lng = parseFloat(req.query.lng) || -77.03051;
    let radius = parseInt(req.query.radius) || 5;
    radius = Math.max(radius, 0);

    // parameter limits
    if (product >= 50000 || product <= 0 || lat < -90 || lat > 90 || lng > 180 || lng < -180 || radius > 200) {
        res.status(400).send(resM(400));
        return;
    }

    let q = 'select id, lat, lng ' +
        'from FARMACIA as far ' +
        'join PROD_FARM as prod on prod.idF = far.id ' +
        'where far.estado = ? ' +
        'and prod.idP = ? ';
    dbConn.query(q, ['3', product], function (err, data) {
        if (err) {
            res.status(500).send(resM(500));
            return;
        }

        function distance(lat1, lon1, lat2, lon2) {
            // console.log(lat1, lon1, lat2, lon2);
            let R = 6378.137; // Radius of earth in KM
            let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
            let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        let ans = [];
        for (let ind = 0; ind < data.length; ind++) {
            let dist = distance(data[ind].lat, data[ind].lng,
                lat, lng);

            if (dist > radius) continue;
            ans.push([data[ind].id, data[ind].lat, data[ind].lng,
                dist]);
        }
        ans.sort(function (a, b) {
            return a[3] - b[3];
        });
        // console.log(ans);
        let json = [];
        for (let i = 0; i < ans.length; i++) {
            json.push({
                id: ans[i][0],
                lat: ans[i][1],
                lng: ans[i][2],
                distance: ans[i][3]
            });
        }
        res.status(200).send(json);
    });
});

module.exports = router;
