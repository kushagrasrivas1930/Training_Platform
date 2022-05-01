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

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    res.render('pages/login.ejs', {login:  "LOGIN"});
})

app.get("/FacultyLogin", (req, res) => {
    res.render('pages/FacultyLogin.ejs', {faculty: "FACULTY LOGIN"})
})
app.get("/FacultySignup", (req, res) => {
    res.render('pages/FacultySignup.ejs')
})

app.get("/StudentSignup", (req, res) => {
    res.render('pages/StudentSignup.ejs')
})

app.get("/AddTest", (req, res) => {
    res.render('pages/AddTest.ejs')
})

app.get("/AddQues", (req, res) => {
    res.render('pages/AddQues.ejs')
})

app.get("/AddQues1", (req, res) => {
    res.render('AddQues.ejs')
})

app.get("/TestDetails_Information", (req, res) => {
    res.render('pages/Test_dets_and list.ejs')
})



// Set EJS as templating engine
app.set('view engine', 'ejs');




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

// db.getConnection((err, connection) => {
//     if (err) throw (err)
//     console.log("DB Connected Successfully: " + connection.threadID)
// })

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
                console.log('successfully added contents to the db');
            })
        res.redirect('/login.html');
    }
    else {

        res.redirect('/signup.html')
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
            res.redirect('/login.html');
        }
        else {
            console.log("Successfully logged in !");
            res.redirect('/login.html');
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
            res.redirect('/FacultyLogin.html');
        }
        else {
            console.log("Successfully logged in !");
            res.redirect('/AddTest.html');
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
                console.log('successfully added contents to the db');
            })
        res.redirect('/FacultyLogin.html');
    }
    else {

        res.redirect('/FacultySignup.html')
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
                res.render(__dirname + '/AddQues.ejs', { test_title: testTitle, totalQuestion: totalQuestion });
            })
        }
        else {
            console.log('Enter a unique TestID');
            res.redirect('/AddTest.html');
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
    res.render(__dirname + '/AddQues.ejs', { test_title: testTitle, totalQuestion: totalQuestion });
    
})