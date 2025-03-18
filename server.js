const express = require("express")

const app = express()
const port = 3000

const { pool, getDBConnection } = require('./database/connect/mariadb')  // mariadb
const userRoutes = require("./routes/user") //user.js
const movieRoutes = require("./routes/movie") // movie.js

app.use(express.json())
app.use("/users", userRoutes)
app.use("/items", movieRoutes)



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
