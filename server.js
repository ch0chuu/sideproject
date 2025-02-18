const express = require("express")

const app = express()
const port = 1901

const { db, id } = require("./data") // data.js에서 db 가져오기
const mariadb = require('./database/connect/mariadb') // mariadb 연동

app.use(express.json())

//모든 영화 조회
    app.get("/items", function (req, res) {
    let items = {}
    db.forEach((value, key) => {
        items[key] = value
    })

    res.json(items)
})

//특정 id의 영화 조회
app.get("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    const item = db.get(id)
    if (item == undefined) {
        res.json({
        message: "영화 정보를 찾을 수 없습니다."
        })
    } else {
        res.json(item)
    }
})

//영화 등록
app.post("/items", (req, res) => {
    console.log(req.body)

    const { title, author, year, genre, summary } = req.body

    //정보를 다 입력하지 않았을 때
    if (!title || !author || !year || !genre || !summary) {
        res.json({ message: "정보를 모두 입력해 주세요." })
    } else {
        //서버 재가동 이후 중복 방지
        const id = db.size > 0 ? Math.max(...db.keys()) + 1 : 6

        //배열
        let genreArray
        if (Array.isArray(genre)) {
            genreArray = genre
        } else {
            genreArray = genre.split(",").map(g => g.trim())
        }

        //객체 생성
        const newMovie = {
            id,
            title,
            author,
            year,
            genre: genreArray,
            summary
        }
        db.set(id, newMovie)

        res.json({
            message: `${title}이(가) 성공적으로 등록되었습니다!`,
            data: newMovie
        })
    }
})


//영화 삭제
app.delete("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    var item = db.get(id)
    if (item == undefined) {
        res.json({
            message: `요청하신 ${id}번 작품은 존재하지 않습니다.`
        })
  } else {
        const title = db.get(id).title
        db.delete(id)

        res.json({
            message: `${title}이 삭제되었습니다.`
        })
  }
})

//전체 영화 삭제
app.delete("/items", function (req, res) {
    let msg = ""
    if (db.size >= 1) {
        db.clear()
        msg = "전체 작품이 삭제되었습니다."
    } else {
        msg = "삭제할 작품이 없습니다."
    }

    res.json({
        message: msg
    })
})

// 영화 정보 수정
app.put("/items/:id", function (req, res) {
    let { id } = req.params
    id = parseInt(id)

    let item = db.get(id)

    if (item == undefined) {
        return res.status(404).json({
            message: `요청하신 ${id}번 작품은 존재하지 않습니다.`
        })
    }else{

    const { title, author, year, genre, summary } = req.body

    // 배열열
    let genreArray
    if (genre) {  
        if (Array.isArray(genre)) {
            genreArray = genre
        } else {
            genreArray = genre.split(",").map(g => g.trim())
        }
    } else {
        genreArray = item.genre 
    }

    
    const updateItem = {
        id,  
        title: title || item.title,
        author: author || item.author,
        year: year || item.year,
        genre: genreArray, 
        summary: summary || item.summary
    }
    db.set(id, updateItem)

    res.json({
        message: `${updateItem.title}의 정보가 수정되었습니다.`,
        data: updateItem
    })

    console.log(updateItem)
    }
})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
