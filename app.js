const express = require('express')
const mysql = require('mysql')

const app = express()

app.listen(3000, () => {
    console.log("Application started on port 3000")
})

app.use(express.static(__dirname))

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

const db = mysql.createPool ({
    connectionLimit : 100,
    host: "127.0.0.1",
    user: "root",
    password: "development",
    database: "db",
    port: "3306"
})

db.getConnection((err, connection) => {
    if (err) throw (err)
    console.log("DB Connected Successfully: " + connection.threadID)
})