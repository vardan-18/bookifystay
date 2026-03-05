if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require("./utils/ExpressError.js");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email'
}, User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser=req.user;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    const dbUrl = process.env.ATLAS_URI;
    await mongoose.connect(dbUrl);
    console.log("connected to db");
}



app.use("/listing", listingRouter);
app.use("/listing/:id/review", reviewRouter);
app.use("/",userRouter);

app.get("/contact", (req, res) => {
    res.render("pages/contact");
});

app.get("/about", (req, res) => {
    res.render("pages/about");
});

app.get("/", (req, res) => {
    res.send("This is working");
});


app.use((req, res, next) => {
    console.log("👀 404 Phantom Request triggered by URL:", req.originalUrl);
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    console.log("----- ERROR DETAILS -----");
    console.log(err.message);
    console.log(err.stack);
    console.log("-------------------------");
    
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message, statusCode });
});

app.listen(8080, () => {
    console.log("app is listening");
});

