const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//mongoose.Schema.Types.sth, we can use Schema.type.sth to keep it simple

// To set thumbnail images, we can create a image schema
// Cloudinary template: https://res.cloudinary.com/demo/image/upload/c_fill,h_250,w_250/docs/models.jpg
const ImageSchema = new Schema({
    url: String,  // store path of cloudinary
    filename: String //store filename of cloudinary
});
ImageSchema.virtual('thumbnail').get(function(){ //we call thumbnail, can get image with that size, it doesn't change anything in db, but the virtual changes
    return this.url.replace('/upload', '/upload/c_fill,h_100,w_200');
});

// mongoose pass JSON data as virtual to the schema that you want to band with
const opts = { toJSON: {virtuals: true} }; 

const CampgroundSchema = new Schema({
    title: String,
    //image: String,
    images: [ImageSchema],
    //add map
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: { //associated collection[one to one]: associated collection
        type: Schema.Types.ObjectId, //act like foreign key
        ref: 'User' // Object id is refered from User model/collection
    },
    reviews:[ //associated collection[one to many]: one campground to many reviews
        {
            type: Schema.Types.ObjectId, //act like foreign key
            ref: 'Review'  //Object id is refered from Review Model
        }
    ],
    // properties:{
    //     popUpMarkup: '<h3>'
    // }
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){ //same with thumbnail, can get propeties values, it doesn't change anything in db, but the virtual changes
    //return "I'M POPUP TEXT!"; // it pass this string to clusterMap's popup content

    //click campground pointer, lead you go to that campground show page
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>` 
});

// oneToMay relationship：when one is deleted, many side should be all deleted
// prevernt from orphan reviews after one camp has been deleted
CampgroundSchema.post('findOneAndDelete', async function(doc) { // doc is one campground instance
    //console.log(doc);
    if(doc){ // if the campground to be deleted is existing, and the doc has reviews
        await Review.deleteMany({ // remove all the reviews where the campground's id field is in its reviews array
            _id: {
                $in: doc.reviews
            }
        })
    }
    //console.log('DELETE THIS CAMP');
})

module.exports = mongoose.model('Campground', CampgroundSchema);
