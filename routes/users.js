const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync'); //we use defined try-catch in this file
//const { register } = require('../models/user');
// const ExpressError = require('../utils/ExpressError');

//includes controllers
const users = require('../controllers/users');

// ======================== users routes functions call controller=========================
/**
 * use expressJS router.routes to organize routes with same path
 */
router.route('/register')
    .get(users.renderRegister)
    .post(users.register);

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

// Show register
//router.get('/register', users.renderRegister);

// Submit Register
//router.post('/register', users.register);

// show login page
//router.get('/login', users.renderLogin);
/**
 * login
 * Use passport.authenticate('server-location', {optional}) to verify login authentication
 * { failureFlash: true, failureRedirect: '/login' }: the optional params mean: 
 * if failt to login, send failure flash message and redirect to /login
 */
//router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//logout
router.get('/logout', users.logout);

module.exports = router;