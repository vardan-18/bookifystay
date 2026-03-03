const express = require("express");
const ExpressError = require("../utils/ExpressError.js");
const router = express.Router();
const nodemailer = require("nodemailer");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const { sendAcceptanceEmail, sendRejectionEmail } = require("../utils/email.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");


const multer = require('multer');
const { storage } = require('../cloudConfig.js'); 
const upload = multer({ storage }); 

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        req.flash('error', msg);
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// HOST DASHBOARD
router.get("/host/dashboard", isLoggedIn, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ host: req.user._id })
                                  .populate("listing")
                                  .sort({ createdAt: -1 }); 

    res.render("listings/dashboard", { bookings });
}));

// ACCEPT BOOKING ROUTE
router.post("/booking/:id/accept", isLoggedIn, wrapAsync(async (req, res) => {

    const booking = await Booking.findById(req.params.id).populate("listing");
    
    if(booking.host.toString() !== req.user._id.toString()) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect("/listing/host/dashboard");
    }


    booking.status = 'accepted';
    await booking.save();


    await sendAcceptanceEmail(booking);

    req.flash("success", "Booking accepted! Confirmation email sent to the guest.");
    res.redirect("/listing/host/dashboard");
}));

// REJECT BOOKING
router.post("/booking/:id/reject", isLoggedIn, wrapAsync(async (req, res) => {
 
    const booking = await Booking.findById(req.params.id).populate("listing");
    
    if(booking.host.toString() !== req.user._id.toString()) {
        req.flash("error", "Permission denied.");
        return res.redirect("/listing/host/dashboard");
    }

    booking.status = 'rejected';
    await booking.save();

    await sendRejectionEmail(booking);

    req.flash("error", "Booking rejected. The guest has been notified."); 
    res.redirect("/listing/host/dashboard");
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs", {});
});

// Create Route
router.post("/", 
    isLoggedIn, 
    upload.single("image"),
    validateListing, 
    wrapAsync(async (req, res) => {
        let url = req.file.path; 
        let filename = req.file.filename; 

        const newListing = new Listing(req.body);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        
        await newListing.save();
        req.flash('success', 'New listing created successfully!');
        res.redirect("/listing");
    })
);

router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listed = await Listing.findById(id)
        .populate('owner')
        .populate({
            path: 'reviews',
            populate: {
                path: 'author', 
                model: 'User'
            }
        });

    if (!listed) {
        req.flash('error', 'Listing not found!');
        return res.redirect("/listing");
    }
    res.render("listings/listing.ejs", { listed });
}));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listed = await Listing.findById(id);
    if (!listed) {
        req.flash('error', 'Listing not found!');
        return res.redirect("/listing");
    }
    res.render("listings/edit.ejs", { listed });
}));

// Update Route 
router.put("/:id", 
    isLoggedIn, 
    isOwner, 
    upload.single("image"), 
    validateListing, 
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body });

        // If a new file was uploaded, update the image field
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        req.flash('success', 'Listing updated successfully!');
        res.redirect(`/listing/${id}`);
    })
);

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted successfully!');
    res.redirect("/listing");
}));


//booking request
router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guestEmail, totalPrice } = req.body;

    
    const listing = await Listing.findById(id);

    
    const newBooking = new Booking({
        listing: id,
        guest: req.user._id, 
        host: listing.owner, //owner of the property
        guestEmail: guestEmail,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice: Number(totalPrice),
        status: 'pending'
    });


    await newBooking.save();

   
    req.flash("success", "Booking request sent! The host will review it shortly.");
    res.redirect(`/listing/${id}`);
}));

// TRIPS DASHBOARD ROUTE
router.get("/user/trips", isLoggedIn, wrapAsync(async (req, res) => {
   
    const trips = await Booking.find({ guest: req.user._id })
                               .populate("listing") 
                               .sort({ createdAt: -1 }); 

    res.render("listings/trips", { trips });
}));

module.exports = router;