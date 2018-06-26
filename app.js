var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");                      
var nodemailer = require("nodemailer");
var expressValidator = require("express-validator");
var expressSession = require("express-session");

var webpack = require("webpack");



var connection = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "3E3JLafy0sJelNcE",
    database: "gigs_archive",
    dateStrings: 'date',
    port: "3306"
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(express.static(__dirname + '/public'));    //use the contents of public (css file)
app.use(expressSession({secret: "yuzon", saveUninitialized: false, resave: false}));
 
app.get('/', (req, res) => {
    res.render("home");
});
 
app.get('/bio', (req, res) => {
    res.render("bio");
});

app.get('/studio', (req, res) => {
    res.render("studio");
});

app.get('/contact', (req, res) => {
    res.render("contact", {title: "Form Validation", success: req.session.success, errors: req.session.errors});
});

app.post('/contact', (req, res) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.live.com',
        port: 587,
        auth: {
            user: 'DJMichaelToor@hotmail.com', 
            pass: 'nv96VG7L' 
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data
    let mailOptions = {
        to: 'alexmarkgalvez@hotmail.com', 
        subject: req.body.subject,
        text:  "Email from " + req.body.fname + " " +  req.body.lname + " at " +  req.body.email + "\n" + "Message: \n" + req.body.message
    };
    
    req.check("email", "Invalid email address").isEmail();
    req.check("fname", "Empty first name property").notEmpty();
    req.check("lname", "Empty last name property").notEmpty();
    req.check("subject", "Empty subject property").notEmpty();
    req.check("message", "Empty message property").notEmpty();

    var errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        req.session.success = false;
    } else {
        req.session.success = true;

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    }
    res.redirect('/contact');
});

app.get('/calender', (req, res) => {
    //app.locals.jQuery = $;
    res.render("calender");
});

app.get('/archive', (req, res) => {
    var q = "SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date FROM gigs LEFT JOIN locations ON gigs.location_id = locations.id ORDER BY start_date DESC";
    connection.query(q, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            var gigs = [];
            for (var i = 0; i < result.length; i++) {
                gigs.push({
                    id: result[i].id,
                    place: result[i].place,
                    event: result[i].event,
                    start_date: result[i].start_date,
                    end_date: result[i].end_date
                });
            }
            res.render("archive", {gigs: gigs});
        }
    });
});

app.get('/archive/:id', (req, res) => {
    var q = "SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date, address, map_url FROM gigs LEFT JOIN locations ON gigs.location_id = locations.id where gigs.id like " + req.params.id;
    connection.query(q, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            var gig = {
                id: result[0].id,
                place: result[0].place,
                event: result[0].event,
                start_date: result[0].start_date,
                end_date: result[0].end_date,
                address: result[0].address,
                map_url: result[0].map_url
            };
            res.render("show", {gig: gig});
        }
    });
});

app.get('*', (req, res) => {
    req.session.errors = null;
    req.session.success = null;
    res.render("error");
});

app.listen(3000, () => {
    console.log("Server has started");
});

