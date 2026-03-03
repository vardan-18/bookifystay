const Listing = require("./models/listing.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You are not logged in!");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirect=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing.owner._id.equals(req.user._id)) {
            req.flash("error", "Permission denied");
            return res.redirect(`/listings/${req.params.id}`);
        }
        
        next();
    } catch (error) {
        req.flash("error", "Something went wrong");
        res.redirect('/listings');
    }
};


// middleware/authorizeReview.js
// module.exports.authorizeReviewOwner = async (req, res, next) => {
//     try {
//         const { id, reviewId } = req.params;
        
//         const listing = await Listing.findById(id);
//         if (!listing) {
//             req.flash('error', 'Listing not found');
//             return res.redirect('/listings');
//         }
        
//         const review = listing.reviews.find(review => 
//             review._id.toString() === reviewId
//         );
        
//         if (!review) {
//             req.flash('error', 'Review not found');
//             return res.redirect(`/listing/${id}`);
//         }
        
//         // SAFE CHECK: Handle undefined author
//         if (!review.author) {
//             console.log(`Review ${reviewId} has no author - allowing deletion or showing error`);
            
//             // Option A: Allow deletion of orphaned reviews
//             // next();
            
//             // Option B: Show error message (recommended)
//             req.flash('error', 'This review has no author information and cannot be deleted');
//             return res.redirect(`/listing/${id}`);
//         }
        
//         // Check authorization
//         if (!review.author.equals(req.user._id)) {
//             req.flash('error', 'You can only delete your own reviews');
//             return res.redirect(`/listing/${id}`);
//         }
        
//         next();
        
//     } catch (error) {
//         console.error('Authorization error:', error);
//         req.flash('error', 'Something went wrong');
//         res.redirect('/listings');
//     }
// };
// module.exports.debugReviewDelete = async (req, res, next) => {
//     console.log('=== DELETE REVIEW DEBUG ===');
//     console.log('User ID:', req.user?._id);
//     console.log('Params:', req.params);
//     console.log('URL:', req.url);
//     next();
// };