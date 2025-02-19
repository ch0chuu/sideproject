const express = require("express")

const app = express()
const port = 1901

const { pool, getDBConnection } = require('./database/connect/mariadb')  // mariadb

app.use(express.json())

//모든 영화 조회
app.get("/items", async function (req, res) {
    try {
        const [movies] = await pool.query( // GROUP_CONCAT(g.name ORDER BY g.name ASC) AS genre -> 같은 영화의 장르를 ','로 연결, 가나다순 정렬
            `SELECT m.id, m.title, m.author, m.year, m.summary, 
                    GROUP_CONCAT(g.name ORDER BY g.name ASC) AS genre
             FROM movies m
             LEFT JOIN movie_genres mg ON m.id = mg.movie_id
             LEFT JOIN genres g ON mg.genre_id = g.id
             GROUP BY m.id`
        )

        if (!movies || movies.length === 0) {
            return res.json({ message: "등록된 영화가 없습니다." })
        }
        const moviesWithGenres = movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            author: movie.author,
            year: movie.year,
            summary: movie.summary,
            genre: movie.genre ? movie.genre.split(",") : [] // 배열 변환환
        }))

        res.json(moviesWithGenres)

    } catch (err) {
        console.error("Database query error:", err)
        res.json({ error: "Database query failed." })
    }
})

//특정 id의 영화 조회
app.get("/items/:id", async function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    try {
        const movie = await pool.query(
            `SELECT m.id, m.title, m.author, m.year, m.summary, 
                IFNULL(GROUP_CONCAT(g.name ORDER BY g.name ASC), '') AS genre 
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            WHERE m.id = ?
            GROUP BY m.id`,
            [id]
        )
        console.log("실행 결과 : ", movie) //데이터 확인용

        if (!movie || movie.length === 0 || !movie[0].length) {
            return res.json({ error: "작품을 찾을 수 없습니다." })
        }

        const movieData = movie[0][0] // 🔥 mysql2 방식 적용
        console.log("movieData:", movieData)
        console.log("genre 변환 후:", movieData.genre ? movieData.genre.split(",").map(g => g.trim()) : [])
        
        const movieWithGenre = {
            id: movieData.id,
            title: movieData.title,
            author: movieData.author,
            year: movieData.year,
            summary: movieData.summary,
            genre: movieData.genre ? movieData.genre.split(",").map(g => g.trim()) : [] // 장르 변환 적용
        }
        
        console.log("최종 변환된 movieWithGenre:", movieWithGenre)
        res.json(movieWithGenre)

    } catch (err) {
        console.error("Database query error:", err)
        res.json({ error: "Database query failed." })
    }
})


//영화 등록
app.post("/items", async (req, res) => {
    console.log(req.body)

    const { title, author, year, genre, summary } = req.body

    if (!title || !author || !year || !genre || !summary) {
        return res.json({ message: "정보를 모두 입력해 주세요." })
    }
    let connection

    try {
        const connection = await getDBConnection()

        if (!connection){
            console.error("DB 연결 실패!")
            return req.json({ error : "DATABASE 연결 실패"})
        }
        await connection.beginTransaction() //트랜잭션 시작

        // movies 삽입
        const movieResult = await connection.query(
            "INSERT INTO movies (title, author, year, summary) VALUES (?, ?, ?, ?)",
            [title, author, year, summary]
        )
        const movieId = movieResult[0].insertId

        // 장르 배열 여부 확인
        const genreArray = Array.isArray(genre)
            ? genre.flatMap(g => g.includes(",") ? g.split(",").map(s => s.trim()) : g)
            : [genre]

        console.log("변환된 genreArray:", genreArray) //로그로 확인하기.

        for (let genreName of genreArray) {
            // genres에 장르 존재 여부 확인
            let genreResult = await connection.query(
                "SELECT id FROM genres WHERE name = ?",
                [genreName]
            )

            let genreId
            if (genreResult[0].length === 0) {
                // 존재하지 않으면 새로 추가
                let insertGenre = await connection.query(
                    "INSERT INTO genres (name) VALUES (?)",
                    [genreName]
                )
                genreId = insertGenre[0].insertId
            } else {
                genreId = genreResult[0][0].id
            }

            // (movie_genres)영화-장르 연결 저장
            await connection.query(
                "INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)",
                [movieId, genreId]
            )
        }

        await connection.commit() //트랜잭션 성공 시 커밋

        res.json({
            message: `${title}이(가) 성공적으로 등록되었습니다!`,
            data: {
                id: movieId,
                title,
                author,
                year,
                genre: genreArray,
                summary
            }
        })
    } catch (err) {
        if (connection){
            await connection.rollback() // 롤백하는 이유는 이미 실행된 쿼리를 삭제하기 위해
        }
        console.error("Database insert error:", err)
        res.json({ error: "영화 등록 실패" })
    } finally {
        if (connection){
            connection.release()
        } 
    }
})


//영화 삭제
app.delete("/items/:id", async function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    try {
        //먼저 영화 검색하기.
        const movie = await pool.query("SELECT title FROM movies WHERE id = ?", [id])
        //없다면?
        if (!movie || movie.length === 0) {
            return res.status(404).json({ error: "작품을 찾을 수 없습니다." })
        }

        const title = movie[0].title //삭제 전에 영화 제목 저장

        // 영화 삭제하기! movie_genres 테이블은 `ON DELETE CASCADE`로 자동 삭제됨
        const deleteResult = await pool.query("DELETE FROM movies WHERE id = ?", [id])

        if (deleteResult.affectedRows === 0) { //arrectedRows
            return res.json({ message: `요청하신 ${id}번 작품은 존재하지 않습니다.` })
        }

        res.json({ message: `${title}이(가) 삭제되었습니다.` })

    } catch (err) {
        console.error("Database delete error:", err)
        res.status(500).json({ error: "정보 삭제 중 오류 발생" })
    }
})


//전체 영화 삭제
app.delete("/items", function (req, res) {
    mariadb.query("TRUNCATE TABLE movies", function(err, result){
        if (err){
            console.error("Database Truncate error! :", err)
            return res.json({error: "전체 삭제 중 오류가 발생했습니다."})
        } else {
            res.json({message : "모든 데이터가 삭제되었습니다."})
        }
    })

})

// 영화 정보 수정
app.put("/items/:id", async function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    const connection = await pool.getConnection()

    try {
        // 트랜잭션 시작
        await connection.beginTransaction()

        // 영화 존재 여부 확인
        const movie = await connection.query("SELECT * FROM movies WHERE id = ?", [id])

        //없다면?
        if (!movie || movie[0].length === 0) {
            await connection.rollback()
            connection.release()
            return res.json({ error: "작품을 찾을 수 없습니다." })
        }

        
        const oldMovie = movie[0][0] // 기존 영화 정보 저장

    
        // 요청된 값이 있으면 업데이트, 없으면 기존 값 유지
        const { title, author, year, genre, summary } = req.body
        const newTitle = title || oldMovie.title
        const newAuthor = author || oldMovie.author
        const newYear = year !== undefined ? year : oldMovie.year
        const newSummary = summary || oldMovie.summary

        

        // 영화 정보 업데이트
        await connection.query(
            "UPDATE movies SET title = ?, author = ?, year = ?, summary = ? WHERE id = ?",
            [newTitle, newAuthor, newYear, newSummary, id]
        )

        // 장르 업데이트 (기존 장르 삭제 후 새 장르 추가)
        let updatedGenre
        if (genre) {
            // 기존 장르 삭제 > 중복 방지!
            await connection.query("DELETE FROM movie_genres WHERE movie_id = ?", [id])

            // 새로운 장르 추가
            const genreArray = Array.isArray(genre) ? genre : [genre]
            updatedGenre = []

            for (let genreName of genreArray) {
                // 장르 존재 여부 확인
                let genreResult = await connection.query(
                    "SELECT id FROM genres WHERE name = ?",
                    [genreName]
                )

                let genreId
                if (genreResult[0].length === 0) {
                    // 존재하지 않으면 새로 추가
                    let insertGenre = await connection.query(
                        "INSERT INTO genres (name) VALUES (?)",
                        [genreName]
                    )
                    genreId = insertGenre[0].insertId
                } else {
                    genreId = genreResult[0][0].id
                }

                // movie_genres 테이블에 새로운 장르 추가
                await connection.query(
                    "INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)",
                    [id, genreId]
                )
                updatedGenre.push(genreName)
            }
        } else {
            //장르가 없으면 기존 장르를 유지하기.
            const existingGenres = await connection.query(
                `SELECT g.name FROM genres g
                 JOIN movie_genres mg ON g.id = mg.genre_id
                 WHERE mg.movie_id = ?`,
                [id]
            )
            updatedGenre = existingGenres[0].map(g => g.name)
        }

        // 트랜잭션 커밋
        await connection.commit()
        connection.release()

        res.json({
            message: `${newTitle}이(가) 업데이트되었습니다.`,
            data: {
                id,
                title: newTitle,
                author: newAuthor,
                year: newYear,
                genre: updatedGenre, //기존 장르 유지 또는 업데이트된 장르 반환
                summary: newSummary
            }
        })


    } catch (err) {
        await connection.rollback()
        connection.release()
        console.error("Database update error:", err)
        res.status(500).json({ error: "영화 업데이트 중 오류 발생" })
    }
})





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
