const express = require("express")

const app = express()
const port = 1901

const { pool, getDBConnection } = require('./mariadb')  // mariadb

app.use(express.json())

//모든 영화 조회
app.get("/items", function (req, res) {
    mariadb.query("SELECT * FROM movies", function(err, items) {
        if (err){
            return res.json({ error : "Database query failed."})
        }else{
            res.json(items)
        }
    });
})

//특정 id의 영화 조회
app.get("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    mariadb.query("SELECT * FROM movies WHERE id = ?", [id], function(err, items){
        if (err) {
            return res.json({ error : "Database query failed."})
        }else if (!items || items.length === 0) {
            return res.json ({ error: "작품을 찾을 수 없습니다."})
        }else{
            res.json(items[0])
        }
    })
})

//영화 등록
app.post("/items", async (req, res) => {
    console.log(req.body)

    const { title, author, year, genre, summary } = req.body

    if (!title || !author || !year || !genre || !summary) {
        return res.status(400).json({ message: "정보를 모두 입력해 주세요." })
    }

    const connection = await getDBConnection() // mariadb 연결 가져오기

    try {
        await connection.beginTransaction() //트랜잭션 시작

        // movies 삽입
        const movieResult = await connection.query(
            "INSERT INTO movies (title, author, year, summary) VALUES (?, ?, ?, ?)",
            [title, author, year, summary]
        )
        const movieId = movieResult.insertId

        // 장르 배열 여부 확인
        const genreArray = Array.isArray(genre) ? genre : [genre]

        for (let genreName of genreArray) {
            // genres에 장르 존재 여부 확인
            let genreResult = await connection.query(
                "SELECT id FROM genres WHERE name = ?",
                [genreName]
            )

            let genreId
            if (genreResult.length === 0) {
                // 존재하지 않으면 새로 추가
                let insertGenre = await connection.query(
                    "INSERT INTO genres (name) VALUES (?)",
                    [genreName]
                )
                genreId = insertGenre.insertId
            } else {
                genreId = genreResult[0].id
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
        await connection.rollback() // 롤백하는 이유는 이미 실행된 쿼리를 삭제하기 위해
        console.error("Database insert error:", err)
        res.json({ error: "영화 등록 실패" })
    } finally {
        connection.release() 
    }
})


//영화 삭제
app.delete("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    mariadb.query("SELECT * FROM movies WHERE id = ?", [id], function(err, items){
        if (err) {
            return res.json({ error : "Database query failed."})
        }else if (!items || items.length === 0) {
            return res.json ({ error: "작품을 찾을 수 없습니다."})
        } else {
            const title = items[0].title //삭제 전 미리 제목을 알아둬야 db가 삭제되고나서 title이 삭제되었다고 출력 가능함.

            mariadb.query("DELETE FROM movies WHERE id = ?", [id], function(err, items){
                if (err){
                    console.error("Database delete error:", err)
                    return res.json({ error: "정보 삭제 중 오류 발생"})
                }else if (items.affectedRows === 0) {
                    return res.json({
                        message: `요청하신 ${id}번 작품은 존재하지 않습니다.`
                    })
              } else {
            
                    res.json({
                        message: `${title}이(가) 삭제되었습니다.`
                    })
              }
            })
        }
    })
    
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
app.put("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    mariadb.query("SELECT * FROM movie WHERE id = ?", [id], function(err, items){
        if (err){
            return res.json({error: "Database query failed."})
        } else if (!items || items.length === 0){
            return res.json ({ error: "작품을 찾을 수 없습니다."})
        } else {
            const olditems = items[0] //기존 영화 정보 저장

            const {title, author, year, genre, summary} = req.body

            let genreString = Array.isArray(genre) ? genre.join(",") : genre //장르 값이 여러개면 배열 처리

            mariadb.query("UPDATE movies SET title = ?, author = ?, year = ?, genre = ?, summary = ?, WHERE id = ?",
                [
                    title || olditems.title,
                    author || olditems.author,
                    year || olditems.year,
                    genreString || 
                ]
            )

        }
    })
})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
