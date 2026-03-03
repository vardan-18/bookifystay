const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirect } = require("../middleware.js");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendEmail");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})


router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body; 
        
        const token = crypto.randomBytes(32).toString("hex");

        const newUser = new User({ 
            email: email, 
            username: username, 
            verificationToken: token 
        });
        const registeredUser = await User.register(newUser, password);

        await sendVerificationEmail(email, token);

        req.flash("success", "Registration successful! Please verify your Gmail to continue.");
        res.redirect("/login");
        
    } catch (e) {
        if (e.code === 11000) {
            req.flash("error", "That email or username is already registered. Please log in.");
            return res.redirect("/signup");
        }
        
        
        req.flash("error", e.message); 
        res.redirect("/signup");
        }
        
    }
    
));


router.get("/verify-email", wrapAsync(async (req, res) => {
    const { token } = req.query;
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
        req.flash("error", "Invalid or expired token.");
        return res.redirect("/signup");
    }

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();
    
    req.login(user, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Email verified! You have been logged in automatically.");
        res.redirect("/listing"); 
    });
}));



router.get("/login",(req,res)=>{
    res.render("user/login.ejs");
})

router.post("/login", saveRedirect, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    if (!req.user.isVerified) {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("error", "Please verify your email address before logging in.");
            return res.redirect("/login");
        });
    } else {
        req.flash("success", "Welcome back to Bookifystay");
        let redirectPath = res.locals.redirectUrl || "/listing";
        res.redirect(redirectPath);
    }
});

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }   
            req.flash("success","You are logged out");
            res.redirect("/listing");
    })
})
module.exports=router;