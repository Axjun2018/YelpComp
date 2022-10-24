const express = require('express');
const router = express.Router({ mergeParams: true }); //some /:params in app.js won't be refered, need to merge
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
//include js model file from another dir
const Campground = require("../models/campground"); 
const Review = require('../models/review'); 
// include reviews controller
const reviews = require('../controllers/reviews');
// include validation middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// =========================== reviews routers ===========================
// Add a review on one campground by id
 router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;