/**
 * routes is used to interact with client-side/webpage
 * upper layer: app.js or ejs template
 * down layer: controller
 */

// Use express.Router()
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
// include multer for file upload
const multer  = require('multer')
const { storage } = require('../cloudinary'); // include cloudinary storage config
const upload = multer({ storage }); //DEFAULT: const upload = multer({ dest: 'uploads/' }), creates uploads at root folder to store uploaded files
//include js model file from another dir
const Campground = require("../models/campground"); 
//includes controllers
const campgrounds = require('../controllers/campgrounds');

// ======================== Campgrounds routes functions call controller=========================
/**
 * use expressJS router.routes to organize routes with same path
 * put route with '/abspath' before route with '/:param'
 */
 router.route('/')
 .get(catchAsync(campgrounds.index))
 .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
// pass as middleware params:
//     .post(upload.array('image', 3), (req, res) => {  //.post(upload.single('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('Works'); //test: look what's in request body in the post form
//  })

//Show campgrounds list
//router.get('/', catchAsync(campgrounds.index)); //pass campgrounds function with ejs file

// Create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
//router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//Show Campground Detail
//router.get('/:id', catchAsync(campgrounds.showCampground));

router.route('/:id')
 .get(catchAsync(campgrounds.showCampground))
 .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
 .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//Edit Camp: PUT
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
//router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))

//DELETE a campground
//router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;