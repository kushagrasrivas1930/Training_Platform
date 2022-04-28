const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
require("dotenv").config()

const app = express()
app.use(bodyParser.urlencoded({extended: false}));
app.listen(3000, () => {
    console.log("Application started on port 3000")
})

app.use(express.static(__dirname))

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool ({
    connectionLimit : 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
})

db.getConnection((err, connection) => {
    if (err) throw (err)
    console.log("DB Connected Successfully: " + connection.threadID)
})

app.post('/signup', function(req, res) {
    var name = req.body.fn + " " + req.body.ln;
    var regno = req.body.rn;
    var password = req.body.ps;
    var conpassword = req.body.cps;
    var phoneno = req.body.pn;
    var cemail = req.body.em;
    db.query('insert into student_details (RegistrationNo, Password, Name, Email, ContactNo) values (?, ?, ?, ?, ?)', 
        [regno, password, name, cemail, phoneno], function(err, result) {
            if (err) console.log(err);
            console.log('succefully added contents to the db');
        })
    res.redirect('/login.html');
    // db.query('insert into student_details (RegistrationNo, Password, Name, Email, ContactNo) values',, )
})

app.post('/login', function (req, res) {
    var username =  req.body.Username ;
    var password =  req.body.Password ;
    console.log(username + ' ' + password);
    db.query("select * from student_details where RegistrationNo = ? and Password = ?" , [username, password], function(err, result) {
        if (err) console.log(err);
        else {
            console.log("Successfully logged in !");
            res.redirect('/login.html');
        }
    })
})
