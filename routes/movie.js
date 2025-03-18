const express = require("express")
const router = express.Router()
const { pool } = require("../database/connect/mariadb")

router.get("/items", async (req, res) => {
    try {
        let sql = `
            SELECT m.id, m.title, m.author, m.year, m.summary, 
                   GROUP_CONCAT(g.name ORDER BY g.name ASC) AS genre
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            GROUP BY m.id`
        
        const [movies] = await pool.query(sql)

        if (!movies.length) {
            return res.json({ message: "등록된 영화가 없습니다." })
        }

        const moviesWithGenres = movies.map(({ id, title, author, year, summary, genre }) => ({
            id,
            title,
            author,
            year,
            summary,
            genre: genre ? genre.split(",") : []
        }))

        res.json(moviesWithGenres)
    } catch (err) {
        res.json({ error: "Database query failed." })
    }
})

router.get("/items/genre", async (req, res) => {
    const { genres } = req.query

    if (!genres) {
        return res.status(400).json({ message: "장르를 입력해 주세요. (예: ?genres=로맨스,액션)" })
    }

    const genreList = genres.split(",").map(g => g.trim())
    let placeholders = genreList.map(() => "?").join(", ")
    
    try {
        let sql = `
            SELECT m.id, m.title, m.author, m.year, m.summary, 
                   GROUP_CONCAT(g.name ORDER BY g.name ASC) AS genre
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            WHERE g.name IN (${placeholders}) 
            GROUP BY m.id`
        
        const [movies] = await pool.query(sql, genreList)

        if (!movies.length) {
            return res.status(404).json({ message: `"${genres}" 장르의 작품이 없습니다.` })
        }

        const moviesWithGenres = movies.map(({ id, title, author, year, summary, genre }) => ({
            id,
            title,
            author,
            year,
            summary,
            genre: genre ? genre.split(",") : []
        }))

        res.status(200).json(moviesWithGenres)
    } catch (err) {
        res.status(500).json({ error: "Database query failed." })
    }
})

router.get("/items/:id", async (req, res) => {
    const { id } = req.params

    try {
        let sql = `
            SELECT m.id, m.title, m.author, m.year, m.summary, 
                   IFNULL(GROUP_CONCAT(g.name ORDER BY g.name ASC), '') AS genre 
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            WHERE m.id = ?
            GROUP BY m.id`
        
        const [movie] = await pool.query(sql, [id])

        if (!movie.length) {
            return res.json({ error: "작품을 찾을 수 없습니다." })
        }

        const { title, author, year, summary, genre } = movie[0]

        res.json({
            id,
            title,
            author,
            year,
            summary,
            genre: genre ? genre.split(",").map(g => g.trim()) : []
        })
    } catch (err) {
        res.json({ error: "Database query failed." })
    }
})

router.post("/items", async (req, res) => {
    const { title, author, year, genre, summary } = req.body

    if (!title || !author || !year || !genre || !summary) {
        return res.json({ message: "정보를 모두 입력해 주세요." })
    }

    let connection

    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()

        let sql = "INSERT INTO movies (title, author, year, summary) VALUES (?, ?, ?, ?)"
        let values = [title, author, year, summary]
        const [movieResult] = await connection.query(sql, values)
        const movieId = movieResult.insertId

        const genreArray = Array.isArray(genre)
            ? genre.flatMap(g => g.includes(",") ? g.split(",").map(s => s.trim()) : g)
            : [genre]

        for (let genreName of genreArray) {
            sql = "SELECT id FROM genres WHERE name = ?"
            const [genreResult] = await connection.query(sql, [genreName])

            let genreId = genreResult.length ? genreResult[0].id : null

            if (!genreId) {
                sql = "INSERT INTO genres (name) VALUES (?)"
                const [insertGenre] = await connection.query(sql, [genreName])
                genreId = insertGenre.insertId
            }

            sql = "INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)"
            await connection.query(sql, [movieId, genreId])
        }

        await connection.commit()
        res.json({ message: `${title}이(가) 성공적으로 등록되었습니다!`, id: movieId })
    } catch (err) {
        if (connection) await connection.rollback()
        res.json({ error: "영화 등록 실패" })
    } finally {
        if (connection) connection.release()
    }
})

router.delete("/items/:id", async (req, res) => {
    const { id } = req.params

    try {
        let sql = "SELECT title FROM movies WHERE id = ?"
        const [movie] = await pool.query(sql, [id])

        if (!movie.length) {
            return res.status(404).json({ error: "작품을 찾을 수 없습니다." })
        }

        const title = movie[0].title

        sql = "DELETE FROM movies WHERE id = ?"
        await pool.query(sql, [id])

        res.json({ message: `${title}이(가) 삭제되었습니다.` })
    } catch (err) {
        res.status(500).json({ error: "정보 삭제 중 오류 발생" })
    }
})

router.delete("/items", async (req, res) => {
    try {
        let sql = "TRUNCATE TABLE movies"
        await pool.query(sql)
        res.json({ message: "모든 데이터가 삭제되었습니다." })
    } catch (err) {
        res.json({ error: "전체 삭제 중 오류가 발생했습니다." })
    }
})

module.exports = router
