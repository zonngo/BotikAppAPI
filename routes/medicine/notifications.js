const express = require('express');
const path = require('path');
const memCache = require('memory-cache');
const router = express.Router();

const dbMed = require(path.join(__dirname, '..', '..', 'database', 'medicine'));
const dbUser = require(path.join(__dirname, '..', '..', 'database', 'accounts'));

const resM = require(path.join(__dirname, '..', '..', 'tools', 'response-manager'));

/**
 *  @api {get} /notifications/news Notificaciones
 *  @apiVersion 1.0.0
 *  @apiName News
 *  @apiGroup Notifications
 *
 *  @apiDescription Devuelve las nuevas notificaciones, es decir, las que el usuario no ha visto todavia.
 *  - Despues de devolver las notificaiones, estas se consideran como ya vistas.
 *
 *  @apiExample {curl} Example usage:
 *    curl https://api.botikapp.zonngo.com/v1.0/notifications/news?session_id=iajldojlnsdfjh
 *
 *  @apiParam {String} [session_id] id de session del usuario, opcional porque tambien se puede enviar como cookie.
 *
 *  @apiSampleRequest /notifications/news?session_id=:session_id
 */

router.get('/news', function (req, res) {
    let session_id = req.cookies.session_id || req.query.session_id;
    let id_user = memCache.get(session_id);

    function getNews(id_user) {
        let q = "select NT.* from NOTI_USER NU " +
            "inner join NOTIFICATIONS NT on NU.id_notification = NT.id " +
            "where NU.estado = 'N' and id_user = ?";

        dbMed.query(q, [id_user], function (err, rows) {
            if (err) {
                console.log(err);
                return res.send(resM(500));
            }

            dbMed.query("update NOTI_USER set `estado` = 'V', fecha = current_timestamp() where id_user = ?", [id_user]);
            res.send(rows);
        });
    }

    function getUser(session_id) {
        let q = 'select * from SESSION where id = ?';
        dbUser.query(q, [session_id], function (err, rows) {
            if (err) {
                console.log(err);
                return res.send(resM(500));
            }
            if (rows.length == 0) {
                return res.send(resM(404, 'session_id no valido'));
            }

            getNews(rows[0].id_user);
            memCache.put(session_id, id_user, 30000);
        });
    }

    if (id_user) {
        getNews(id_user);
    } else {
        getUser(session_id);
    }
});

/**
 *  @api {post} /notifications/sendn Subir una notificacion
 *  @apiVersion 1.0.0
 *  @apiName Post
 *  @apiGroup Notifications
 *
 *  @apiDescription Solo para las pruebas.
 *  Al terminar de hacer las pruebas con las notificaciones se quitara este recurso.
 *
 *  @apiExample {curl} Example usage:
 *    curl https://api.botikapp.zonngo.com/v1.0/notifications/post
 *
 *  @apiParam {String} token Una cadena con el que se autoriza usar este recurso.
 *  @apiParam {String} message El mensaje de la notificacion.
 *  @apiParam {String} image_link Link de una imagen.
 *  @apiParam {String} email Email del usuario al que se quiere enviar la notificacion.
 *
 *  @apiSampleRequest /notifications/sendn
 */

router.post('/sendn', function (req, res) {
    let token = req.body.token || 'nt';

    if (token != 'testing_notifications_zonngo_2017') {
        return res.status(401).send(resM(401));
    }

    let message = req.body.message || '';
    let image = req.body.image_link || '';
    let email = req.body.email || '';

    function sendNotification(id_user) {
        let q = 'insert into NOTIFICATIONS(message, image_link, `type`) values(?, ?, ?)';

        dbMed.query(q, [message, image, 'P'], function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(500).send(resM(500));
            }

            q = 'insert into NOTI_USER(id_notification, id_user, estado) values(?, ?, ?)';
            dbMed.query(q, [rows.insertId, id_user, 'N']);

            res.status(201).send(resM(201));
        });
    }

    dbUser.query('select id from USERS where email = ? limit 1', [email], function (err, rows) {
        if (err) {
            console.log(err);
            return res.status(500).send(resM(500));
        }

        if (rows.length == 0) {
            return res.status(404).send(resM(404));
        }

        sendNotification(rows[0].id);
    });
});

module.exports = router;
