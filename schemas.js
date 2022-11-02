// server-side validation by JOI schema
const BaseJoi = require('joi'); // js validation tool
const sanitizeHtml = require('sanitize-html'); // sanitize html input

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: { // define a extension on joi called escapeHTML()
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],  //nothing allowed
                    allowedAttributes: {},  //nothing allowed
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension)

module.exports.campgoundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array() //deleteImages is the same name with edit.ejs checkbox value， and it's not required
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().min(5).escapeHTML(), // min & max on string: for string length
        rating: Joi.number().required().min(1).max(5) //min & max on number: for number range
    }).required() //the whole review object is required if add a review
});
