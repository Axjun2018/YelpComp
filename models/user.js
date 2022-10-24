// use passport-local-mongoose for user authentication

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * free to define your User how you like
 */
const UserSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true //need validation middleware
    }
});

/** First you need to plugin Passport-Local Mongoose into your User schema
 * Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
*/
UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model('User', UserSchema);
