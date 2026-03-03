const express = require("express");
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access listing id
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, authorizeReviewOwner, debugReviewDelete } = require("../middleware.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// Create review - POST /listing/:id/review
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let { rating, comment } = req.body;
    
    let newReview = new Review({
        rating: rating,
        comment: comment,
        author: req.user._id
    });
    
    // Convert to plain object to preserve all fields when embedding
    const reviewToEmbed = newReview.toObject();
    listing.reviews.push(reviewToEmbed);
    
    await listing.save();
    await newReview.save();

    res.redirect(`/listing/${id}`);
}));

router.delete("/:reviewId",isLoggedIn, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listing/${id}`);
}));

module.exports = router;