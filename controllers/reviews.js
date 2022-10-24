//include js model file from another dir
const Campground = require("../models/campground"); 
const Review = require('../models/review'); 

/**
 * Add a review on one campground by id
 */
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //construct a new review
    review.author = req.user._id; // assign user's id from request to author: add author(witch == user._id) to database
    campground.reviews.push(review); // push to reviews array in campground
    await review.save(); //save in both collection
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
    //res.send('You Post a review!');
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    //find the campround id, update the review where the reviewId is linked
    await Campground.findByIdAndUpdate(id, {$pull: { review: reviewId}}); //$pull is mongodb operator, it finds the object by key-value, then delete
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    //res.send('DELETED!');
    res.redirect(`/campgrounds/${id}`); //here we can use ${id}, because the line 1 of the function got the id, or we can use campground._id as well
}