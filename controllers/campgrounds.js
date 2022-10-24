/**
 * Controller is used to interact with server-side/database
 * upper layer: routes
 * down layer: datatbase/server
 */

//include js model file from another dir
const Campground = require("../models/campground"); 
const { cloudinary } = require('../cloudinary');

/**
 * Show campgrounds list
 */
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

/**
 * Create new campground
 * Must new first, then show second
 * If /campgrounds/:id in front of campgrounds/new, then new is treated like an id, which can be found
 */
module.exports.renderNewForm = (req, res) => {
    //when create new, need authentication first
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login'); //we should return to stop this create new function
    }
    //campgrounds = await new Campground();
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res, next) => {
    //by default, req.body is empty, after submit form, the /campgrounds page is empty, need parse it: app.use(express.urlencoded({extended: true}))
    //res.send(req.body);
    // Add this line to avoid POST error request actually happen in database: when use Postman or website has been Hacked, not the url request
    //if the POST request doesn't send required campground fields, throw error 400-incomplete data, no new campgound will be add
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); // basic validator without using Joi
    const campground = new Campground(req.body.campground);
    //Save uploads to database: .images from campgrounds schema, is assigned to request.files components
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campground.author = req.user._id; // assign user's id from request to author: add author(witch == user._id) to database
    await campground.save(); //only the db interaction need to wait
    console.log(campground); //test
    req.flash('success', 'successfully made a new campground!'); //req.flash('flashFuncName', 'msg')
    res.redirect(`/campgrounds/${campground._id}`); //redirect needs to specify the part that specified in app.js
}

/**
 * Show Campground Detail
 */
module.exports.showCampground = async (req, res) => {
    const { id } = req.params; // this equivalent to req.params.id, which is ready to pass findById(req.params.id )
    //pupulate('arrayKey') --> to display the items in that array of the object; build connection with foreign collections
    const campground = await Campground.findById(id).populate({ // nested populate
        path: 'reviews',  //populate the reviews
        populate: {        // with each review's author
            path: 'author'
        }
    }).populate('author'); //populate the found camp's author
    //console.log(campground);
    // if we didn't find campground, show error alert
    if(!campground) { // to test, we only can use the id generated by mongodb, or it can't be parsed, then the flash msg won't show
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    //console.log(campground);
    res.render('campgrounds/show', { campground });
}

/**
 * Edit Camp: PUT
 * need method_override, and a form to submit request
 */
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.editCampground = async (req, res) => {
    //res.send('WORKS!');
    const { id } = req.params;  //id, {updatekey: newValue}; { ...req.body.campground } means split each key to update
    //console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename})); //this map an array in mongodb
    campground.images.push(...imgs); //push some objects into an array respectively stored by key of object in array
    await campground.save(); // need save the updated campground.images
    if(req.body.deleteImages){ // if user checkboxed to delete image(s)
        //deleted images should be also deleted from cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename); //delete by filename in cloudinary
        }
        //console.log(req.body.deleteImages);
        const trimedImagesForDelete = req.body.deleteImages.map((aImg) => aImg.trim()); // trim to get accurate filename of image
        //console.log(trimedImagesForDelete);
        // Delete and save the specific camp's data in request where its image names are in request body
        await campground.updateOne({ $pull: { images: { filename: { $in: trimedImagesForDelete }}}}); //$pull is delete in mongodb
        console.log(campground);
    }
    req.flash('success', 'Successfully update campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

/**
 * DELETE a campground
 * need method_override, and a form to submit request
 */
module.exports.deleteCampground = async (req, res) => {  //route here: where to delete from?
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds'); // after delete: where to go?
}