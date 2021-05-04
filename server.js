const express = require("express");
const session = require("express-session");
const mongo = require("mongoose");
const ejs = require("ejs");
const ip = "127.0.0.1";
const port = 5000;


// Import Database URL !
const urlObj = require("./setup/config");

// Import generate function !

const GenerateLatLon = require("./utilities/generate");

// Import User Table to store data ! 
const User = require("./tables/User");


// Connect Database !
mongo.connect(urlObj.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(function () {
        console.log("Database Connected Successfully !");
    })
    .catch(function (err) {
        console.log(`Something went wrong : ${err}`);
    });



let app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

let sess = {
    name: "Child",
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))


// Requested Paths !

// For serving static html pages !
// app.use("/", express.static(__dirname + "/public"));

function checkSession(request, response, next) {
    console.log(request.session.Name);
    if (request.session.Name) {
        response.redirect("/");
    } else {
        next();
    }
}

function redirectHome(request, response, next) {
    console.log(request.session.Name);
    if (!request.session.Name) {
        response.redirect("/home");
    } else {
        next();
    }
}


app.get("/home", checkSession, function (request, response) {
    response.send(`<h1>Child Details</h1>
                    <form action="/childdetails" method="POST">
                    <input type="text" name="name" placeholder="Enter Name" autocomplete="off">
                    <input type="datetime-local" name="end_time">
                    <button>Submit</button>
                    </form>`)
});


app.post("/childdetails", function (request, response) {

    // Create User Object !

    const userObj = {
        name: request.body.name,
        timeStamp: new Date().toLocaleTimeString(),
        endTime: request.body.end_time,
        coordinates: []
    }

    new User(userObj).save()
        .then(function (user) {
            console.log("Data stored successfully !");
            console.log("User stored : ", user);


            // Create Session !
            request.session.Name = request.body.name;
            request.session.ID = user._id;

            // Response  - Redirect to /
            response.redirect("/");

        })
        .catch(function (error) {
            console.log("Error storing data on database :", error);
        });
});


app.get("/", redirectHome, function (request, response) {
    response.render("index");
});



app.get("/data", redirectHome, function (request, response) {
    let value = GenerateLatLon();
    value.time = new Date().toLocaleTimeString();


    console.log("Value string :", value);

    console.log(request.session.Name);

    // Update coordinates on database !

    User.findOne({
            _id: request.session.ID
        })
        .then(function (user) {

            // Check if user exists or not !
            if (!user) {
                response.send("User doesn't exists !");
            } else {

                // Check time !

                console.log("End time in ms :", Date.parse(user.endTime));
                console.log("Real time in ms :", Date.now());

                if (Date.parse(user.endTime) - Date.now() > 0) {
                    console.log("Time left !");

                    // Update Coordinates !

                    User.updateOne({
                            _id: user._id
                        }, {
                            $push: {
                                coordinates: value
                            }
                        }, {
                            $new: true
                        })
                        .then(function () {
                            console.log("Coordinates Updated Successfully !");

                            console.log("After Update : ", user);

                            response.json(user.coordinates);
                        })
                        .catch(function (error) {
                            console.log("Something went wrong :", error);
                        });

                } else {
                    console.log("Time over !");

                    // Destroy the session !
                    request.session.destroy(function () {
                        // cannot access session here

                        response.json({
                            destroy: "Session Destroyed !"
                        })
                    })

                }


            }
        })
        .catch(function (error) {
            console.log("Something went wrong :", error);
        });
});



app.listen(port, ip, function () {
    console.log("Server is running....");
});