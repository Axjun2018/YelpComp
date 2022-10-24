// define server-side validations middleware by Joi

const {campgoundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
//include js model file from another dir
const Campground = require("./models/campground"); 
const Review = require("./models/review"); 

/**
 * Middleware for PASSPORT authentication
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns if fails authentication, redirect to /login and return; 
 *          if passed authentication, call next() middleware/route
 */
module.exports.isLoggedIn = (req, res, next) => { //Campgrounds: new
    //console.log('REQ.USER:  ', req.user); //take a look current signed in user, when we triggered authenticated router functions
    if(!req.isAuthenticated()){
        //store the url that user was requesting, after login user can go back the page before login
        //console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl; // set returnTo session
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login'); //we should return to stop this create new function
    }
    next();
}

// Campgrounds: post & put -- new & edit
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgoundSchema.validate(req.body); //error is an array may contain one or more error messages
    if(error){
        const msg = error.details.map(el => el.message).join(',') //delimite error array with , if there are multi-error-messages
        throw new ExpressError(msg, 400);
    }else{
        next(); //don't forget this
    }
}
//campgrounds: new & edit & delete
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;  //id, {updatekey: newValue}; { ...req.body.campground } means split each key to update
    const campground = await Campground.findById(id);
    //SERVER-SIDE AUTHORIZATION
    if(!campground.author.equals(req.user._id)){ //prevent hacking from changing routes to edit, eg: http://localhost:3000/campgrounds/<id>/edit
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// reviews: post & delete -- new & delete
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body); //validate is a function of JOI schema
    //console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',') //delimite error array with , if there are multi-error-messages
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}
//reviews: delete
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;  // reviewId is the same with the review's delete route's path '/:reviewId'; id is the same with 'campground/:id'
    const review = await Review.findById(reviewId); // use reviewId to find review
    //SERVER-SIDE AUTHORIZATION
    if(!review.author.equals(req.user._id)){ //prevent hacking from changing routes to edit
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`); //redirect by campground id
    }
    next();
}

// module.exports.funcVar = function()=>{...define...}
// require this file in router files, 
// pass the function isLoggedIn as parameter into the function that need authentication