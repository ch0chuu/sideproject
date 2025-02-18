const mariadb = require('mysql')

const conn = mariadb.createPool(
    {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database : 'movie_db'
    }

);

module.exports = conn