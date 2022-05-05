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
var json;
var len;
var string;
var apti;
var tech;
var eng;
var nA, nT, nE;


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


app.get("/FacultyLogin", (req, res) => {
    res.render('pages/FacultyLogin.ejs',)
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
    res.render('pages/AddQues.ejs', { totalQuestion: 12, test_title: "Current Test Title(Sample Parameter) " })
})

// app.get("/Testlist_student", (req, res) => {
//     res.render('pages/testlist_student.ejs', { duration: 0, apti: 0, tech: 0, eng: 0 })
// })


app.post("/TestDetails_student", (req, res) => {

    var testname = req.body.testname;
    var test_id;
    let p = new Promise((resolve, reject) => {
        // console.log(testname);
        db.query("select TestID from test_details where TestTitle = ?", testname, function (err, result) {
            string = JSON.stringify(result);
            // console.log(string);
            json = JSON.parse(string);
            // console.log(json);
            test_id = json[0].TestID;
            // console.log(test_id);
            resolve(test_id);
        });
        // console.log(test_id);

    })
    p.then((message) => {
        // console.log(message);
        db.query("select count(if(SectionID = 'A', 1, null)) as cA, count(if(SectionID = 'T', 1, null)) as cT, count(if(SectionID = 'E', 1, null)) as cE from question_bank where TestID = ?", message, function (err, result) {
            if (err) console.log(err);
            else {
                var st = JSON.stringify(result);
                var js = JSON.parse(st);
                nA = js[0].cA;
                nT = js[0].cT;
                nE = js[0].cE;
                console.log(nA + " " + nT + " " + nE);
                res.render('pages/Test_dets.ejs', { testname: testname, duration: 2, apti: nA, tech: nT, eng: nE })

            }
        });
    })

    // console.log(nA + " " + nT + " " + nE);
})

app.get("/FacultyTestList", (req, res) => {
    db.query("select TestTitle from test_details", function (err, result) {
        string = JSON.stringify(result);
        // console.log('>> string: ', string);
        json = JSON.parse(string);
        // console.log('>> json : ', json);
    })
    res.render(__dirname + '/views/pages/FacultyTestList.ejs', { test_name: json });

})

app.get("/directToCreateTest", (req, res) => {
    res.render("pages/AddTest.ejs")
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
    db.query("select TestTitle from test_details", function (err, result) {
        string = JSON.stringify(result);
        // console.log('>> string: ', string);
        json = JSON.parse(string);
        console.log('>> json : ', json);
    })
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
            res.render(__dirname + '/views/pages/testlist_student.ejs', { test_name: json });
        }
    })
})

app.post('/faculty-login', function (req, res) {
    db.query("select TestTitle from test_details", function (err, result) {
        string = JSON.stringify(result);
        // console.log('>> string: ', string);
        json = JSON.parse(string);
        console.log('>> json : ', json);
    })
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


            res.render(__dirname + '/views/pages/FacultyTestList.ejs', { test_name: json });
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

app.post('/add_FacultyTestList', function (req, res) {
    let p = new Promise ((resolve, reject) =>{
        db.query("select TestTitle from test_details", function (err, result) {
            string = JSON.stringify(result);
            // console.log('>> string: ', string);
            json = JSON.parse(string);
            // console.log('>> json : ', json);
            resolve(json)
        });
    });
    p.then((message) => {
        res.render(__dirname + '/views/pages/FacultyTestList.ejs', { test_name: json });
    })
    
    // var section = req.body.topic_section_dropdown;
    // console.log(section);
    // var question = req.body.Question_Des;
    // var oA = req.body.option_details_A;
    // var oB = req.body.option_details_B;
    // var oC = req.body.option_details_C;
    // var oD = req.body.option_details_D;
    // var corrOption = req.body.options;
    // var sectionID;
    // if (section == 'Aptitude') {
    //     sectionID = 'A';
    //     questionID = aQuesID;
    //     aQuesID++;
    // }
    // if (section == 'Technical') {
    //     sectionID = 'T';
    //     questionID = tQuesID;
    //     tQuesID++;
    // }
    // if (section == 'English') {
    //     sectionID = 'E';
    //     questionID = eQuesID;
    //     eQuesID++;
    // }
    // db.query('insert into question_bank (TestID, SectionID, QuestionID, Question, OptionA, OptionB, OptionC, OptionD, Correct) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    //     [testID, sectionID, questionID, question, oA, oB, oC, oD, corrOption], function (err, result) {
    //         if (err) console.log(err);
    //         console.log('Question Added successfully');
    //     })
    // totalQuestion++;

    

})