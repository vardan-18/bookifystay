const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
       image: {
        url: String, // The secure URL provided by Cloudinary
        filename: String // The unique ID for the image
    }, 
        price: Number,
        location: String,
        country: String,
        contact: {
    phone: {
      type: String,
      required: true 
    },
    email: {
      type: String,
      required: true
    }
    },
        
        reviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
);

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);