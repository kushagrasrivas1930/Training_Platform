const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const ejs = require('ejs');

require("dotenv").config()

var testTitle;
var testID;
var questionID;
var totalQuestion = 1;

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000, () => {
    console.log("Application started on port 3000")
})

app.use(express.static(__dirname))

app.set('views engine', 'ejs')

app.get("/", (req, res) => {
    res.render(__dirname + '/views/pages/login.ejs')
})

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool({
    connectionLimit: 100,
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

app.post('/signup', function (req, res) {
    var name = req.body.fn + " " + req.body.ln;
    var regNo = req.body.rn;
    var password = req.body.ps;
    var conPassword = req.body.cps;
    var phoneNo = req.body.pn;
    var cEmail = req.body.em;
    if (conPassword == password) {
        db.query('insert into student_details (RegistrationNo, Password, Name, Email, ContactNo) values (?, ?, ?, ?, ?)',
            [regNo, password, name, cEmail, phoneNo], function (err, result) {
                if (err) console.log(err);
                console.log('succefully added contents to the db');
            })
        res.render(__dirname + '/views/pages/login.ejs');
    }
    else {

        res.render(__dirname + '/views/pages/signup.ejs')
    }

    // db.query('insert into student_details (RegistrationNo, Password, Name, Email, ContactNo) values',, )
})

app.post('/login', function (req, res) {
    var username = req.body.Username;
    var password = req.body.Password;
    console.log(username + ' ' + password);
    db.query("select * from student_details where RegistrationNo = ? and Password = ?", [username, password], function (err, result) {
        console.log(result);
        if (result == 0) {
            console.log('No such user present TRY AGAIN');
            res.render(__dirname + '/views/pages/login.ejs');
        }
        else {
            console.log("Successfully logged in !");
            res.render(__dirname + '/views/pages/login.ejs');
        }
    })
})

app.post('/faculty-login', function (req, res) {
    var username = req.body.Username;
    var password = req.body.Password;
    console.log(username + ' ' + password);
    db.query("select * from faculty_details where EmpID = ? and Password = ?", [username, password], function (err, result) {
        console.log(result);
        if (result == 0) {
            console.log('No such user present TRY AGAIN');
            res.render(__dirname + '/views/pages/FacultyLogin.ejs');
        }
        else {
            console.log("Successfully logged in !");
            res.render(__dirname + '/views/pages/AddTest.ejs');
        }
    })
})

app.post('/faculty-signup', function (req, res) {
    var name = req.body.fn + " " + req.body.ln;
    var empID = req.body.empID;
    var password = req.body.ps;
    var conPassword = req.body.cps;
    var phoneNo = req.body.phoneNo;
    var cEmail = req.body.cEmail;
    var dept = req.body.dept;
    if (conPassword == password) {
        db.query('insert into faculty_details (EmpID, Name, Email, ContactNo, Dept, Password) values (?, ?, ?, ?, ?, ?)',
            [empID, name, cEmail, phoneNo, dept, password], function (err, result) {
                if (err) console.log(err);
                console.log('succefully added contents to the db');
            })
        res.render(__dirname + '/views/pages/FacultyLogin.ejs');
    }
    else {

        res.render(__dirname + '/views/pages/FacultySignup.ejs')
    }
})

app.post('/createTest', function (req, res) {
    testTitle = req.body.testTitle;
    testID = req.body.testID;
    db.query('select TestId from test_details where TestID = ?', testID, function (err, result) {
        if (result == 0) {
            db.query('insert into test_details (TestID, TestTitle) values (?, ?)', [testID, testTitle], function (err, result) {
                if (err) console.log(err);
                console.log("Test Created successfully");
                aQuesID = tQuesID = eQuesID = 1;
                res.render(__dirname + '/views/pages/AddQues.ejs', { test_title: testTitle, totalQuestion: totalQuestion });
            })
        }
        else {
            console.log('Enter a unique TestID');
            res.render(__dirname + '/views/pages/AddTest.ejs');
        }
    })


})

app.post('/addQues', function (req, res) {
    var section = req.body.topic_section_dropdown;
    var question = req.body.Question_Des;
    var oA = req.body.option_details_A;
    var oB = req.body.option_details_B;
    var oC = req.body.option_details_C;
    var oD = req.body.option_details_D;
    var corrOption = req.body.options;
    var sectionID;
    if (section == 'Aptitude') {
        sectionID = 'A';
        questionID = aQuesID;
        aQuesID++;
    }
    if (section == 'Technical') {
        sectionID = 'T';
        questionID = tQuesID;
        tQuesID++;
    }
    if (section == 'English') {
        sectionID = 'E';
        questionID = eQuesID;
        eQuesID++;
    }
    db.query('insert into question_bank (TestID, SectionID, QuestionID, Question, OptionA, OptionB, OptionC, OptionD, Correct) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [testID, sectionID, questionID, question, oA, oB, oC, oD, corrOption], function (err, result) {
            if (err) console.log(err);
            console.log('Question Added successfully');
        })
    totalQuestion++;
    res.render(__dirname + '/views/pages/AddQues.ejs', { test_title: testTitle, totalQuestion: totalQuestion });
    
})