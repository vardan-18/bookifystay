const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    
    // Remember to leave image allowing empty/null for Multer
    image: Joi.string().allow("", null), 

    contact: Joi.object({
        phone: Joi.string().required(),
        email: Joi.string().email().required() 
    }).required()
});

module.exports.reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().allow("", null),
});