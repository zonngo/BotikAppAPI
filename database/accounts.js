const mysql = require('mysql');

module.exports = mysql.createPool({
    connectionLimit: 10,
    host: process.env.LOG_DB_HOST,
    database: process.env.LOG_DB_NAME,
    user: process.env.LOG_DB_USER,
    password: process.env.LOG_DB_PASSWORD
});
