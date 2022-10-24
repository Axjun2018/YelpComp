//this is a self-contained file, don't need to connect with express
//but need to connect with mongoose to access with database

const mongoose = require('mongoose');
const Campground = require("../models/campground") //.. means back 1 more level out of seeds, then find models/campground
const Review = require("../models/review");
const cities = require("./cities"); // . referes to current dir: ./siblingfile
const { places, descriptors } = require('./seedHelpers'); // import multiple {array1, array2, ...}

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]; //pass an array and return the random ele of the array

//define a function interacting with db
const seedDB = async () => {
    await Campground.deleteMany({}); // clear the collection
    await Review.deleteMany({});
    //const c = new Campground({ title: 'purple field' })
    //await c.save()
    for (let i = 0; i < 50; i++) {  // randomly insert 50 campgrounds among 1000 instances
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6350b0727e57f69aaf76d33f', //insert all campground, the owner is user2
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251', //give random camp pics by this url (must be valid url, includes https://)
            images: [
                {
                        url:'https://res.cloudinary.com/dbu69dh96/image/upload/v1666392475/YelpCamp/c8zjyjc8wolamuqfwymh.jpg',
                        filename: 'YelpCamp/c8zjyjc8wolamuqfwymh'
                },
                {
                    url:'https://res.cloudinary.com/dbu69dh96/image/upload/v1666392476/YelpCamp/tczv6dqe0iws0qbandhq.jpg',
                    filename: 'YelpCamp/tczv6dqe0iws0qbandhq'
                }
            ],
            description: 'Providing opportunities for leadership development, spiritual and personal growth, environmental stewardship, lifelong personal connections, fun and adventure.',
            price
        })
        await camp.save();
    }
}
// invoke the async function, then close after insertion
seedDB().then(() => {
    mongoose.connection.close();
});