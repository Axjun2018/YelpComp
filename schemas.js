// server-side validation by JOI schema
const Joi = require('joi'); // js validation tool

module.exports.campgoundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    deleteImages: Joi.array() //deleteImages is the same name with edit.ejs checkbox value， and it's not required
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().min(5), // min & max on string: for string length
        rating: Joi.number().required().min(1).max(5) //min & max on number: for number range
    }).required() //the whole review object is required if add a review
});
