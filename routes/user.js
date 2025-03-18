const express = require("express")
const router = express.Router()
const { pool } = require("../database/connect/mariadb")

router.post("/login", async (req, res) => {
    const { username, pwd } = req.body

    if (!username || !pwd) {
        return res.status(400).json({ message: "ID와 비밀번호를 입력하세요." })
    }

    try {
        const sql = "SELECT name FROM users WHERE username = ? AND pwd = ?"
        const values = [username, pwd]
        const [rows] = await pool.query(sql, values)

        if (rows.length === 0) {
            return res.status(401).json({ message: "ID 또는 비밀번호가 일치하지 않습니다." })
        }

        res.status(200).json({ message: `${rows[0].name}님 환영합니다` })
    } catch (err) {
        res.status(500).json({ error: "서버 오류 발생" })
    }
})

router.post("/register", async (req, res) => {
    const { email, pwd, name, contact } = req.body

    if (!email || !pwd || !name || !contact) {
        return res.status(400).json({ message: "모든 정보를 입력하세요." })
    }

    try {
        let sql = "SELECT email FROM users WHERE email = ?"
        const [existingUser] = await pool.query(sql, [email])

        if (existingUser.length > 0) {
            return res.status(409).json({ message: "이미 존재하는 이메일입니다." })
        }

        sql = "INSERT INTO users (email, pwd, name, contact) VALUES (?, ?, ?, ?)"
        let values = [email, pwd, name, contact]
        await pool.query(sql, values)

        sql = "SELECT id, email, name, contact, created_at FROM users WHERE email = ?"
        const [user] = await pool.query(sql, [email])

        res.status(201).json({ message: `${name}님 환영합니다`, user: user[0] })
    } catch (err) {
        res.status(500).json({ error: "회원 가입 중 오류 발생" })
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const sql = "SELECT id, email, name, contact, created_at FROM users WHERE id = ?"
        const [rows] = await pool.query(sql, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
        }

        res.status(200).json(rows[0])
    } catch (err) {
        res.status(500).json({ error: "회원 조회 중 오류 발생" })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        let sql = "SELECT name FROM users WHERE id = ?"
        const [rows] = await pool.query(sql, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
        }

        const userName = rows[0].name

        sql = "DELETE FROM users WHERE id = ?"
        await pool.query(sql, [id])

        res.status(200).json({ message: `${userName}님 다음에 뵙겠습니다` })
    } catch (err) {
        res.status(500).json({ error: "회원 탈퇴 중 오류 발생" })
    }
})

console.log("User routes loaded!")

module.exports = router
