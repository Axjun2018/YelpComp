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

const CampgroundSchema = new Schema({
    title: String,
    //image: String,
    images: [ImageSchema],
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
    ]
})

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
