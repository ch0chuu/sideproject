const express = require("express");
const router = express.Router();
const { pool } = require("../database/connect/mariadb"); // DB 연결 가져오기

// 로그인 (POST)
router.post("/login", async (req, res) => {
    const { username, pwd } = req.body

    if (!username || !pwd) {
        return res.status(400).json({ message: "ID와 비밀번호를 입력하세요." })
    }

    try {
        const [rows] = await pool.query("SELECT name FROM users WHERE username = ? AND pwd = ?", [username, pwd])

        if (rows.length === 0) {
            return res.status(401).json({ message: "ID 또는 비밀번호가 일치하지 않습니다." })
        }

        res.status(200).json({ message: `${rows[0].name}님 환영합니다` })
    } catch (err) {
        console.error("로그인 오류:", err)
        res.status(500).json({ error: "서버 오류 발생" })
    }
})

//  회원 가입 (POST)
router.post("/register", async (req, res) => {
    const { username, pwd, name } = req.body

    if (!username || !pwd || !name) {
        return res.status(400).json({ message: "모든 정보를 입력하세요." })
    }

    try {
        // 아이디 중복 체크
        const [existingUser] = await pool.query("SELECT username FROM users WHERE username = ?", [username])
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "이미 존재하는 ID입니다." })
        }

        await pool.query("INSERT INTO users (username, pwd, name) VALUES (?, ?, ?)", [username, pwd, name])

        res.status(201).json({ message: `${name}님 환영합니다` })
    } catch (err) {
        console.error("회원 가입 오류:", err)
        res.status(500).json({ error: "회원 가입 중 오류 발생" })
    }
})

// 회원 개별 조회 (GET)
router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const [rows] = await pool.query("SELECT id, name FROM users WHERE id = ?", [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
        }

        res.status(200).json(rows[0])
    } catch (err) {
        console.error("회원 조회 오류:", err)
        res.status(500).json({ error: "회원 조회 중 오류 발생" })
    }
})

//회원 개별 탈퇴 (DELETE)
router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const [rows] = await pool.query("SELECT name FROM users WHERE id = ?", [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." })
        }

        const userName = rows[0].name
        await pool.query("DELETE FROM users WHERE id = ?", [id])

        res.status(200).json({ message: `${userName}님 다음에 뵙겠습니다` })
    } catch (err) {
        console.error("회원 탈퇴 오류:", err)
        res.status(500).json({ error: "회원 탈퇴 중 오류 발생" })
    }
})
console.log("User routes loaded!")

module.exports = router
