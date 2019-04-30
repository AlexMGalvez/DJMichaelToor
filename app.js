let express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mysql            = require("mysql"),                   
    nodemailer       = require("nodemailer"),
    expressValidator = require("express-validator"),
    expressSession   = require("express-session"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local");  //username and password

//mysql database connection
let connection = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "3E3JLafy0sJelNcE",
    database: "gigs_archive",
    dateStrings: "date",
    port: "3306",
    multipleStatements: true
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(express.static(__dirname + "/public"));    //use the contents of public (css file)
app.use(expressSession({
    name: "contact.sid", 
    secret: "ku7mVsItuTE", 
    saveUninitialized: false, 
    resave: false
}));
app.use(passport.initialize());  //owner session
app.use(passport.session());     //owner session

let User = {username: "dog", password: "dogg"};  //owner login information

passport.use(new LocalStrategy(
    (username, password, done) => {
        if (username != User.username) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (password != User.password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, username);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/", (req, res) => {
    res.render("home");
});
 
app.get("/bio", (req, res) => {
    res.render("bio");
});

app.get("/studio", (req, res) => {
    res.render("studio");
});

app.get("/contact", (req, res) => {
    res.render("contact", {title: "Form Validation", success: req.session.success, errors: req.session.errors});
});

app.post("/contact", (req, res) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.live.com",
        port: 587,
        auth: {
            user: "DJMichaelToor@hotmail.com", 
            pass: "nv96VG7L" 
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data
    let mailOptions = {
        to: "alexmarkgalvez@hotmail.com", //TEMPORARY EMAIL
        subject: req.body.subject,
        text:  "Email from " + req.body.fname + " " +  req.body.lname + " at " +  req.body.email + "\n" + "Message: \n" + req.body.message
    };
    
    req.check("email", "Invalid email address").isEmail();
    req.check("fname", "Empty first name property").notEmpty();
    req.check("lname", "Empty last name property").notEmpty();
    req.check("subject", "Empty subject property").notEmpty();
    req.check("message", "Empty message property").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
    } else {
        req.session.success = true;

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
        });
    }
    res.redirect("/contact");
});

app.get("/calendar", (req, res) => {
    const q = `SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%m/%d/%y') AS start_date, DATE_FORMAT(start_date, '%m') - 1 AS start_month, DATE_FORMAT(start_date, '%d') AS start_day, DATE_FORMAT(start_date, '%Y') AS start_year, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               ORDER BY start_date DESC`;

    connection.query(q, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            let gigs = [];
            for (var i = 0; i < result.length; i++) {
                gigs.push({
                    id: result[i].id,
                    place: result[i].place,
                    event: result[i].event,
                    start_date: result[i].start_date,
                    start_month: result[i].start_month,
                    start_day: result[i].start_day,
                    start_year: result[i].start_year,
                    end_date: result[i].end_date
                });
            }
            res.render("calendar", {gigs: gigs});
        }
    });
});

app.get("/archive", (req, res) => {
    const q = `SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               ORDER BY start_date DESC`;

    connection.query(q, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            let gigs = [];
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

app.get("/archive/:id", (req, res) => {
    const q = `SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date, address, map_url 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               WHERE gigs.id like ?`;

    connection.query(q, [req.params.id], (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            let gig = {
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

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/archiveOptions",
    failureRedirect: "/login"
}), (req, res) => {
    const q = "";
    connection.query(q, (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        }
    });
});

//middleware granting owner permission if logged in
isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("login");
});

app.get("/archiveOptions", isLoggedIn, (req, res) => {
    const q = `SELECT gigs.id, gigs.location_id, place, event, DATE_FORMAT(start_date, '%m/%d/%y') AS start_date, DATE_FORMAT(start_date, '%m') - 1 AS start_month, DATE_FORMAT(start_date, '%d') AS start_day, DATE_FORMAT(start_date, '%Y') AS start_year, DATE_FORMAT(end_date, '%m/%d/%y') AS end_date, TIME_FORMAT(start_date, '%H:%i:%s') AS start_time, TIME_FORMAT(end_date, '%H:%i:%s') AS end_time 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               ORDER BY start_date DESC;    

               SELECT id, place, address, map_url 
               FROM locations`;

    connection.query(q, [1, 2], (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            let gigs = [];
            for (var i = 0; i < result[0].length; i++) {
                gigs.push({
                    id: result[0][i].id,
                    location_id: result[0][i].location_id,
                    place: result[0][i].place,
                    event: result[0][i].event,
                    start_date: result[0][i].start_date,
                    start_month: result[0][i].start_month,
                    start_day: result[0][i].start_day,
                    start_year: result[0][i].start_year,
                    end_date: result[0][i].end_date,
                    start_time: result[0][i].start_time,
                    end_time: result[0][i].end_time
                });
            }
            let locations = [];
            for (var i = 0; i < result[1].length; i++) {
                locations.push({
                    id: result[1][i].id,
                    place: result[1][i].place,
                    address: result[1][i].address,
                    map_url: result[1][i].map_url
                });
            }
            res.render("archiveOptions", {gigs: gigs, locations: locations});
        }
    });
});

//SQL insert or edit gig
app.post("/archiveOptions", (req, res) => {
    let q = ``
    
    if(req.body.editB == 0){
        q = `INSERT INTO gigs (location_id, event, start_date, end_date)
             VALUES (?, ?, STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"), STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"))`;
    } else {
        q = `UPDATE gigs
             SET location_id=?, event=?, start_date= STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"), end_date= STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s")
             WHERE id=?`;
    }
    connection.query(q, 
        [
            req.body.location, 
            req.body.event, 
            req.body.sdate + " " + req.body.stime + ":00", 
            req.body.edate + " " + req.body.etime + ":00", 
            req.body.editB
        ],
        (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            res.redirect("/archiveOptions");
        }
    });
});

app.post("/archiveOptionsDelete", (req, res) => {
    const q = `DELETE FROM gigs
               WHERE id=?`;

    connection.query(q, [req.body.deleteB], (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            res.redirect("/archiveOptions");
        }
    });
});

app.post("/newLocation", (req, res) => {
    const q = `INSERT INTO locations (place, address, map_url)
               VALUES (?, ?, ?)`;

    connection.query(q, 
        [
            req.body.place,
            req.body.address,
            req.body.murl
        ], 
        (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            res.redirect("/archiveOptions");
        }
    });
});

app.post("/editLocation", (req, res) => {
    const q = `UPDATE locations
               SET place=?, address=?, map_url=?
               WHERE id=?`;

    connection.query(q, 
        [
            req.body.placeE,
            req.body.addressE,
            req.body.murlE,
            req.body.locationid
        ], 
        (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            res.redirect("/archiveOptions");
        }
    });
});

app.post("/deleteLocation", (req, res) => {
    const q = `DELETE FROM locations
               WHERE id=? AND id NOT IN (SELECT location_id
                                         FROM gigs)`;

    connection.query(q, [req.body.deleteLocB], (error, result) => {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
            res.redirect("/archiveOptions");
        }
    });
});

app.get("*", (req, res) => {
    req.session.errors = null;
    req.session.success = null;
    res.render("error");
});

app.listen(3000, () => {
    console.log("Server has started");
});

