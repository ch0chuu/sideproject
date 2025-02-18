const express = require("express")

const app = express()
const port = 1901

const mariadb = require('./database/connect/mariadb') // mariadb 연동

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
app.post("/items", (req, res) => {
    console.log(req.body)

    const { title, author, year, genre, summary } = req.body

    //정보를 다 입력하지 않았을 때
    if (!title || !author || !year || !genre || !summary) {
        res.json({ message: "정보를 모두 입력해 주세요." })
    } else {
        let genreString = Array.isArray(genre) ? genre.join(",") : genre //두 개 이상 문자열 배열 처리

        mariadb.query("INSERT INTO movies (title, author, year, genre, summary) VALUES (?, ?, ?, ?, ?)", [title, author, year, genre, summary],
            function(err, items) {
                if (err) {
                    console.error("Database insert error", err)
                    return res.json({ error : "영화 등록 실패"})
                } else {
                    res.json({
                        message : `${title}이(가) 성공적으로 등록되었습니다!`,
                        data : {
                            id : items.insertId,
                            title,
                            author,
                            year,
                            genre,
                            summary
                        }
                    })
                }
            }
         )
    }
})


//영화 삭제
app.delete("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    mariadb.query("DELETE FROM movies WHERE id = ?", [id], function(err, items){
        if (err){
            console.err("Database delete error:", err)
            return res.json({ error: "정보 삭제 중 오류 발생"})
        }else if (items.affectedRows === 0) {
            res.json({
                message: `요청하신 ${id}번 작품은 존재하지 않습니다.`
            })
      } else {
    
            res.json({
                message: `${title}이(가) 삭제되었습니다.`
            })
      }
    })
    
})

// //전체 영화 삭제
// app.delete("/items", function (req, res) {
//     let msg = ""
//     if (db.size >= 1) {
//         db.clear()
//         msg = "전체 작품이 삭제되었습니다."
//     } else {
//         msg = "삭제할 작품이 없습니다."
//     }

//     res.json({
//         message: msg
//     })
// })

// // 영화 정보 수정
// app.put("/items/:id", function (req, res) {
//     let { id } = req.params
//     id = parseInt(id)

//     let item = db.get(id)

//     if (item == undefined) {
//         return res.status(404).json({
//             message: `요청하신 ${id}번 작품은 존재하지 않습니다.`
//         })
//     }else{

//     const { title, author, year, genre, summary } = req.body

//     // 배열열
//     let genreArray
//     if (genre) {  
//         if (Array.isArray(genre)) {
//             genreArray = genre
//         } else {
//             genreArray = genre.split(",").map(g => g.trim())
//         }
//     } else {
//         genreArray = item.genre 
//     }

    
//     const updateItem = {
//         id,  
//         title: title || item.title,
//         author: author || item.author,
//         year: year || item.year,
//         genre: genreArray, 
//         summary: summary || item.summary
//     }
//     db.set(id, updateItem)

//     res.json({
//         message: `${updateItem.title}의 정보가 수정되었습니다.`,
//         data: updateItem
//     })

//     console.log(updateItem)
//     }
// })




app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
