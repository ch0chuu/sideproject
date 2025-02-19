const mariadb = require('mysql2/promise')

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
    try {
        const connection = await pool.getConnection()
        return connection
    } catch (err) {
        console.error("DB 연결 실패:", err)
        return null // 오류 발생 시 null 반환
    }
}

module.exports = {pool, getDBConnection}