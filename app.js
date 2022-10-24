// use dotenv under this condition
if(process.env.NODE_ENV !== "production") { //if we are in develop environment mode
    require('dotenv').config(); //require the .env file
}
// console.log(process.env.SECRETE); //print SECRETE value in .env
// console.log(process.env.API_KEY);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //include ejs-mate engine
const session = require('express-session'); // used to generate session
const flash = require('connect-flash'); // for flash message
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const User = require('./models/user'); //require the User model

// import from routes folder, then use later
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.")
})
const app = express();

app.engine('ejs', ejsMate); //use ejs-mate engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//============== use middleware =====================
// session/cookies generator, each request generate different cookies
const sessionConfig = {
    secret: 'thisshouldbrabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookies: { 
        httpOnly: true, // HttpOnly is an additional flag included in a Set-Cookie HTTP response header. Using the HttpOnly flag when generating a cookie helps mitigate the risk of client side script accessing the protected cookie (if the browser supports it).
        // user shouldn't login forever, must set a expire date for session
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Date.now() return milliseconds. 1000: convert to second, 60: to min, 60: to hours, 24: to days, 7: to weeks
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)); // this must be used before passport.session
app.use(flash());

/**
 * config passport
 */
app.use(passport.initialize());
app.use(passport.session());
//Static passport methods are exposed on the model constructor. ↓
passport.use(new LocalStrategy(User.authenticate())); //STATIC: authenticate() Generates a function that is used in Passport's LocalStrategy
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); // let user get into the session
passport.deserializeUser(User.deserializeUser()); // let user get out of the session

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // set query string inside
app.use(express.static(path.join(__dirname, 'public'))); // use that dir as static folder: stores static files, imgs,...

// ============ area to create new property for res ===================
// make a flash message: save successfully--show, refresh the page--gone
// set it before routers, then use next() pass to routers
app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); // make a middleware, call success as response
    res.locals.error = req.flash('error'); // show flash error message
    next();
})

// ================ routes =====================
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email: 'wenjun@gmail.com', username: 'wen'});
//     //Static passport methods
//     const newUser = await User.register(user, 'passapassword'); // register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique.
//     res.send(newUser);
// })

// use the routes
app.use('/campgrounds', campgroundRoutes); // all campground routes/paths start from /campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    //res.send('Hello from Yelp Camp!')
    res.render('home');
})

// apply for every request with invalid url path: 404 error
app.all('*', (req, res, next) => {
    //res.send('404!!!');
    next(new ExpressError('Page Not Found', 404));
})

// apply for every request with data validation error: 500 server error
app.use((err, req, res, next) =>{
    // we can set default value in { var=default }, if no value provided on these params
    //const { statusCode = 500, message = 'Something Went Wrong' } = err;
    //res.status(statusCode).send(message);
    const { statusCode = 500 } = err;
    if( !err.message ) err.message = 'Oh No! Something Went Wrong!'; // if err.message doen't set, set it to default: ...
    res.status(statusCode).render('error', { err }); //render error.ejs, pass err to template
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})