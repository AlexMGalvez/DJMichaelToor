let fs               = require("fs"),                 //file reader
    express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    flash            = require("connect-flash"),      //flash messages
    mysql            = require("mysql"),              //database   
    nodemailer       = require("nodemailer"),         //email
    crypto           = require("crypto"),             //token generator
    async            = require("async"),
    expressValidator = require("express-validator"),
    expressSession   = require("express-session"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),     //session for local username and password
    bcrypt           = require("bcrypt");             //user password hashing
                       require("dotenv").config()     //loads variables from .env -used for sensitive information

//mysql database connection
var pool  = mysql.createPool({
    connectionLimit     : 10,
    host                : process.env.DB_HOST,
    user                : process.env.DB_USER,
    password            : process.env.DB_PASS,
    database            : process.env.DB_NAME,
    dateStrings         : "date",
    port                : process.env.PORT,
    multipleStatements  : true,
    connectTimeout      : 20000,
    acquireTimeout      : 20000
  });

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.use(expressValidator());
app.use(express.static(__dirname + "/public"));    //use the contents of public (css file)
app.use(expressSession({
    name: process.env.ES_NAME,
    secret: process.env.ES_SECR,
    saveUninitialized: false, 
    resave: false
}));
app.use(passport.initialize());  //user session
app.use(passport.session());     //user session

//email transporter
let transporter = nodemailer.createTransport({
    host: "smtp.live.com",
    port: 587,
    auth: {
        user: process.env.NM_USER,
        pass: process.env.NM_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

//user login
passport.use(new LocalStrategy((username, password, done) => {
    let q = `SELECT * FROM users`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    let User = {username: result[0].username, password: result[0].password};
    
                    if (username != User.username) {
                        return done(null, false, { message: 'Incorrect username.' });
                    } else {
                        //unhash password
                        bcrypt.compare(password, User.password, function(err, res) {
                            if(res) {
                                if (username != User.username) {
                                    return done(null, false, { message: 'Incorrect username.' });
                                }
                            } else {
                                return done(null, false, { message: 'Incorrect password.' });
                            } 
                            return done(null, username);
                        });
                    }
                    connection.destroy();
                }
            });
        }
    })
}));

passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

//message handeling with flash
app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/", (req, res) => {
    let widgets = fs.readFileSync("./display/home.txt").toString().split("\n");
    res.render("home", {widgets: widgets});
});
 
app.get("/bio", (req, res) => {
    let bioText = fs.readFileSync("./display/bio.txt", "utf8");  
    res.render("bio", {bioText: bioText});
});

app.get("/studio", (req, res) => {
    let studioText = fs.readFileSync("./display/studio.txt", "utf8"); 
    res.render("studio", {studioText: studioText});
});

app.get("/contact", (req, res) => {
    res.render("contact", {title: "Form Validation", success: req.session.success, errors: req.session.errors});
});

app.post("/contact", (req, res) => {
    // setup email data
    let mailOptions = {
        to: process.env.NM_OUTG, //TEMPORARY EMAIL
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
               ORDER BY DATE(start_date) DESC`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, function (error, result) {
                let gigs = [];
                if (error) {
                    console.log(error);
                } else {
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
                }
                res.render("calendar", {gigs: gigs});
                connection.release();
            });
        }
    });
});

app.get("/archive", (req, res) => {
    const q = `SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               ORDER BY DATE(start_date) DESC`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, function (error, result) {
                let gigs = [];
                if (error) {
                    console.log(error);
                } else {
                    for (var i = 0; i < result.length; i++) {
                        gigs.push({
                            id: result[i].id,
                            place: result[i].place,
                            event: result[i].event,
                            start_date: result[i].start_date,
                            end_date: result[i].end_date
                        });
                    }
                }
                res.render("archive", {gigs: gigs});
                connection.release();
            });
        }
    });
});

app.get("/archive/:id", (req, res) => {
    const q = `SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date, address, map_url 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               WHERE gigs.id like ?`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
            res.redirect("error");
        } else {
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
                connection.release();
            });
        }
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/archive_options",
    failureRedirect: "/login",
    failureFlash : true
}));

//middleware granting user permission if logged in
isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

app.get("/login/identify", (req, res) => {
    res.render("identify");
});

//password reset by email (forgot password)
// app.post("/login/identify", (req, res) => {
//     async.waterfall([
//         function(done){
//             //generate token
//             crypto.randomBytes(20, function(err, buf){
//                 var token = buf.toString('hex');
//                 if(err){
//                     console.log(error);
//                     return res.redirect("error");
//                 }
//                 done(null, token);
//             });
//         },
//         function(token, done){
//             let q = `SELECT * FROM users WHERE email=?`;

//             pool.getConnection(function(error, connection) {
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     //check if email exists in database
//                     connection.query(q, [req.body.email], (error, result) => {
//                         if (error) {
//                             console.log(error);
//                             return res.redirect("error");
//                         } else if (!result[0]) {
//                             req.flash("error", "No account with that email address exists");
//                             res.redirect("/login/identify");
//                         } else {
//                             let q = `UPDATE users
//                                     SET resetPasswordToken=?, resetPasswordExpires= DATE_ADD(?, INTERVAL 1 HOUR)
//                                     WHERE email=?`;

//                             pool.getConnection(function(error, connection) {
//                                 if (error) {
//                                     console.log(error);
//                                 } else {
//                                     //inputs current date and adds 1 hours through the querry
//                                     let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

//                                     connection.query(q, [token, currentDate, req.body.email], (error, r) => {
//                                         if (error) {
//                                             console.log(error);
//                                             return res.redirect("error");
//                                         } else {
//                                             done(null, token, result);
//                                         }
//                                     })
//                                     //res.redirect("/login");
//                                 }
//                                 connection.destroy();
//                             });
//                         }
//                         connection.destroy();
//                     })
//                 }
//             });
//         },
//         function(token, result, done){  
//             // setup email data
//             let mailOptions = {
//                 to: process.env.NM_OUTG, //TEMPORARY EMAIL (will be  req.body.email)
//                 subject: "DJ Michael Toor Website Password Reset",
//                 text: "You are recieving this email because you (or someonone else) has requested to change your password. \n" +
//                       "In case you forgot your username, it is " + result[0].username + ".\n\n" +
//                       "Please click the following link, or paste it into your browser to complete the process:\n" + 
//                       "http://" + req.headers.host + "/reset/" + token + "\n\n" +
//                       "If you did not make this request, please ignore this email and your password will remain unchanged."
//             };
//             // send mail with defined transport object
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     return console.log(error);
//                 }
//                 console.log("Message sent: %s", info.messageId);
//                 req.flash("success", "An email has been sent to " + result[0].email + " with further instructions");
//                 done(null, "done");
//             });
//         }
//     ], function(err){
//         if (err) {
//             return next()
//         };
//         res.redirect("/login");
//     });
// });

// app.get("/reset/:token", function(req, res){
//     let q = `SELECT * FROM users WHERE resetPasswordToken=?`;

//     pool.getConnection(function(error, connection) {
//         if (error) {
//             console.log(error);
//         } else {
//             //check if token is valid
//             connection.query(q, [req.params.token], (error, result) => {
//                 let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                
//                 if (error) {
//                     console.log(error);
//                     return res.redirect("error");
//                 } else if (result[0] == undefined || result[0].resetPasswordExpires < currentDate) {
//                     req.flash("error", "Password reset token is invalid or has expired");
//                     return res.redirect("/login/identify");
//                 }
//                 res.render("reset", {token: req.params.token});
//                 connection.destroy();
//             });
//         }
//     });
// });

// app.post("/reset/:token", function(req, res){
//     async.waterfall([
//         function(done){
//             let q = `SELECT * FROM users WHERE resetPasswordToken=?`;

//             //check if token is valid
//             pool.query(q, [req.params.token], (error, result) => {
//                 let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                
//                 if (error) {
//                     console.log(error);
//                     return res.redirect("error");
//                 } else if (result[0] == undefined || result[0].resetPasswordExpires < currentDate) {
//                     req.flash("error", "Password reset token is invalid or has expired");
//                     return res.redirect("/login/identify");
//                 }
//                 if (req.body.newPW === req.body.newPW2 && req.body.newPW.length >= 8) {
//                     //hash and update new password
//                     let user = result[0];
//                     bcrypt.hash(req.body.newPW, 10, function(err, hash) {
//                         if (err){
//                             console.log(err);
//                             return res.redirect("error");
//                         } else {
//                             let q = `UPDATE users
//                                      SET password=?, resetPasswordToken=?, resetPasswordExpires=?
//                                      WHERE username=?`;

//                             pool.query(q, [hash, undefined, undefined, user.username], (error, result) => {
//                                 if (error) {
//                                     console.log(error);
//                                     return res.redirect("error");
//                                 }
//                                 done(err, user);
//                             });
//                         }
//                     });
//                 } else {
//                     if(req.body.newPW.length < 8){
//                         req.flash("error", "Password must be over 8 characters in length");
//                     } else if(req.body.newPW != req.body.newPW2){
//                         req.flash("error", "Passwords do not match");
//                     }
//                     return res.redirect("/reset/" + req.params.token);
//                 }
//             });
//         }, 
//         function(user, done){
//             // setup email data
//             let mailOptions = {
//                 to: process.env.NM_OUTG, //TEMPORARY EMAIL (will be  req.body.email)
//                 subject: "Your password has been changed",
//                 text: "Hello \n\n" +
//                       "This is a confirmation that your account password for the DJ Michael Toor website has just been changed for user " + user.username + ".\n"
//             };
//             // send mail with defined transport object
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     return console.log(error);
//                 }
//                 console.log("Message sent: %s", info.messageId);
//                 req.flash("success", "Your password has been changed and a confirmation email has been sent to " + user.email);
//                 done(null,"done");
//             });
//         }
//     ], function(err){
//         if (err) {
//             return next();
//         };
//         res.redirect("/login");
//     });
// });

app.get("/logout", (req, res) => {
    req.logout(); 
    req.flash("success", "Logged you out");
    res.redirect("/login");
});

app.get("/archive_options", isLoggedIn, (req, res) => {
    const q = `SELECT gigs.id, gigs.location_id, place, event, DATE_FORMAT(start_date, '%m/%d/%y') AS start_date, DATE_FORMAT(start_date, '%m') - 1 AS start_month, DATE_FORMAT(start_date, '%d') AS start_day, DATE_FORMAT(start_date, '%Y') AS start_year, DATE_FORMAT(end_date, '%m/%d/%y') AS end_date, TIME_FORMAT(start_date, '%H:%i:%s') AS start_time, TIME_FORMAT(end_date, '%H:%i:%s') AS end_time 
               FROM gigs 
               LEFT JOIN locations ON gigs.location_id = locations.id 
               ORDER BY DATE(start_date) DESC;    

               SELECT id, place, address, map_url 
               FROM locations`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, [1, 2], (error, result) => {
                let gigs = [];
                let locations = [];
        
                if (error) {
                    console.log(error);
                } else {
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
                    for (var i = 0; i < result[1].length; i++) {
                        locations.push({
                            id: result[1][i].id,
                            place: result[1][i].place,
                            address: result[1][i].address,
                            map_url: result[1][i].map_url
                        });
                    }
                }
                res.render("archive_options", {gigs: gigs, locations: locations});
                connection.release();
            });
        }
    });
});

//SQL insert or edit gig
app.post("/archive_options", isLoggedIn, (req, res) => {
    let q = ``
    
    if(req.body.editB == 0){
        q = `INSERT INTO gigs (location_id, event, start_date, end_date)
             VALUES (?, ?, STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"), STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"))`;
    } else {
        q = `UPDATE gigs
             SET location_id=?, event=?, start_date= STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s"), end_date= STR_TO_DATE(?, "%m/%d/%Y %H:%i:%s")
             WHERE id=?`;
    }
    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
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
                    res.redirect("/archive_options");
                }
                connection.release();
            });
        }
    });
});

app.post("/archiveOptionsDelete",  isLoggedIn, (req, res) => {
    const q = `DELETE FROM gigs
               WHERE id=?`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, [req.body.deleteB], (error, result) => {
                if (error) {
                    console.log(error);
                    res.redirect("error");
                } else {
                    res.redirect("/archive_options");
                }
                connection.destroy();
            });
        }
    });
});

app.post("/newLocation", isLoggedIn, (req, res) => {
    const q = `INSERT INTO locations (place, address, map_url)
               VALUES (?, ?, ?)`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
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
                    res.redirect("/archive_options");
                }
                connection.destroy();
            });
        }
    });
});

app.post("/editLocation", isLoggedIn, (req, res) => {
    const q = `UPDATE locations
               SET place=?, address=?, map_url=?
               WHERE id=?`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
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
                    res.redirect("/archive_options");
                }
                connection.release();
            });
        }
    });
});

app.post("/deleteLocation", isLoggedIn, (req, res) => {
    const q = `DELETE FROM locations
               WHERE id=? AND id NOT IN (SELECT location_id
                                         FROM gigs)`;

    pool.getConnection(function(error, connection) {
        if (error) {
            console.log(error);
        } else {
            connection.query(q, [req.body.deleteLocB], (error, result) => {
                if (error) {
                    console.log(error);
                    res.redirect("error");
                } else {
                    res.redirect("/archive_options");
                }
                connection.destroy();
            });
        }
    });
});

app.get("/user_options", isLoggedIn, (req, res) => {
    res.render("user_options");
});

// app.post("/changePassword", isLoggedIn, (req, res) => {
//     let userPassword = req.body.prevPW;
//     let q = `SELECT * FROM users`;

//     pool.query(q, (error, result) => {
//         if (error) {
//             console.log(error);
//         } else {
//             let User = {username: result[0].username, password: result[0].password};
            
//             //unhash password
//             bcrypt.compare(userPassword, User.password, function(err, res) {
//                 if(res && req.body.newPW.localeCompare(req.body.newPW2) == 0 && req.body.newPW.length >= 8) {
//                     //user password is correct, new password1 = new password2 and new password >= 8 characters
    
//                     //hash and update new password
//                     bcrypt.hash(req.body.newPW, 10, function(err, hash) {
//                         if (err){
//                             console.log(err);
//                         } else {
//                             let q = `UPDATE users
//                                      SET password=?
//                                      WHERE username=?`;

//                             pool.query(q, [hash, User.username], (error, result) => {
//                                 if (error) {
//                                     console.log(error);
//                                 }
//                             });
//                         }
//                     });
//                 } else {
//                     // FIXME: error is initiated here
//                     console.log(err);
//                 } 
//             });
//         }
//     });
//     res.redirect("user_options");
// });

app.get("/display", isLoggedIn, (req, res) => {
    let widgets = fs.readFileSync("./display/home.txt").toString().split("\n");
    let bioText = fs.readFileSync("./display/bio.txt", "utf8");  
    let studioText = fs.readFileSync("./display/studio.txt", "utf8");  
    res.render("display", 
    {
        bioText: bioText, 
        studioText: studioText, 
        widgets: widgets
    });
});

app.post("/editDisplay", isLoggedIn, (req, res) => {
    fs.writeFileSync("./display/home.txt", req.body.widget1 + "\n" + req.body.widget2 + "\n" + req.body.widget3 + "\n")
    fs.writeFileSync("./display/bio.txt", req.body.editBio)
    fs.writeFileSync("./display/studio.txt", req.body.editStudio)
    res.redirect("display");
});

app.get("*", (req, res) => {
    req.session.errors = null;
    req.session.success = null;
    res.render("error");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started");
});

