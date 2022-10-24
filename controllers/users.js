const User = require('../models/user');

/**
 * Show register
 */
 module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
/**
 * Submit Register
 */
module.exports.register = async (req, res) => {
    // res.send(req.body); //return {"username":["John","jdoe@gmail.com"],"password":"123456"}, salt and hash value won't show
    try{
        const { email, username, password } = req.body; // get the 3 key values from request body
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); //passport static method
        // console.log(registeredUser);
        req.login(registeredUser, err => { //auto login after register
            if(err){
                return next(err);
            }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    }catch(err){
        req.flash('error', err.message);
        res.redirect('/register'); // when there is no error, both /register and register worked
    }
}
/**
 * show login page
 */
 module.exports.renderLogin= (req, res) => {
    res.render('users/login');
}
/**
 * login
 */
module.exports.login = (req, res) => { //authenticate on local server
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //if there is session url return to, return to it; if not, return to '/campgrounds'
    delete req.session.returnTo; //after we stored redirectUrl, delete returnTo property defined on session since user already logged in.
    res.redirect(redirectUrl);
}

/**
 * logout
 * req.logout() is now an asynchronous function in Passport 2022
 */
module.exports.logout = (req, res, next) => {
    req.logout( (err)=>{
        if(err) {
            req.flash('error', err);
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
