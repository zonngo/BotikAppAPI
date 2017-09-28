const express = require('express');
const router = express.Router();
const dbConn = require('../../database/medicine');
const resM = require('../../tools/response-manager');
const validator = require("email-validator");

function toString_(variable) {
    if (typeof variable != 'String') {
        return variable.toString();
    }
}

/**
 *  @api {post} / Registro para obtener la aplicacion
 *  @apiVersion 1.0.0
 *  @apiName RegistroApp
 *  @apiGroup ZonngoApp
 *
 *  @apiDescription Requerimientos: \
 - Email valido y no mayor a 50 de tamaño \
 - Celular no mayor a 15 de tamaño
 *  @apiDescription Respuesta: \
 - Se enviara un correo para descargar la app
 *
 *  @apiExample {curl} Example usage:
 *    curl --data "email=xd@gmail.com&celular=912345678" https://api.botikapp.zonngo.com/v1.0/android
 *
 *  @apiParam {String} email Email del usuario
 *  @apiParam {String} celular Celular del usuario
 *
 *  @apiSampleRequest /android
 */

router.post('/', function (req, res) {
    function uniqueEmail() {
        var sql = 'select * from ANDROID where email = ?';
        dbConn.query(sql, [email], function (err, rows) {
            if (err) {
                console.log('error db ANDROID uniqueEmail');
                res.status(500).send(resM(500));
                return;
            }
            if (rows.length > 0) {
                res.status(400).send(resM(400, 'Email ya existe'));
                return;
            }
            register();
        });
    }

    function register() {
        var sql = 'INSERT INTO ANDROID (id, email, celular) values(?, ?, ?)';
        dbConn.query(sql, [0, email, celular], function (err, rows) {
            if (err) {
                console.log('error db ANDROID');
                res.status(500).send(resM(500));
                return;
            }
            res.status(200).send(resM(200));
        });
    }

    let email = toString_(req.body.email || '');
    let celular = toString_(req.body.celular || '');

    if (!validator.validate(email)) {
        res.status(400).send(resM(400, 'Email invalido'));
        return;
    }
    if (50 < email.length) {
        res.status(400).send(resM(400, 'Email invalido'));
        return;
    }
    if (celular.length < 9 || 15 < celular.length) {
        res.status(400).send(resM(400, 'Celular invalido'));
        return;
    }
    uniqueEmail();
});

module.exports = router;