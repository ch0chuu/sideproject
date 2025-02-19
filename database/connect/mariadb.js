const mariadb = require('mysql')

const pool = mariadb.createPool(
    {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database : 'movie_db'
    }

)

async function getDBConnection() {
    return await pool.getConnection()
}

module.exports = {pool, getDBConnection}