const mysql = require('mysql');

module.exports = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MED_DB_HOST,
    database: process.env.MED_DB_NAME,
    user: process.env.MED_DB_USER,
    password: process.env.MED_DB_PASSWORD
});
