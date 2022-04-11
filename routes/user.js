const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/register', (req, res) => {
	res.render('user/register');
});

router.post('/register', (req, res) => {

	let errors = [];

	// Verifying if password and repeated password are different
	if(req.body.password != req.body.password2) {
		errors.push({text: 'Repeated password doesn\'t match.'});
	}

	

	if(errors.length > 0) {
		res.render('user/register', {errors: errors});
	} else {

		/* Before user creation, very if email informed already exists */
		User.findOne({email: req.body.email}).then(user => {

			// If email exists, inform user
			if(user) {
				req.flash('error_msg', 'Email already in use.');
				res.redirect('/user/register');
			} else { // Else, create user

				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				});

				// Encrypting password before saving to database
				bcrypt.genSalt(10, (error, salt) => {
					bcrypt.hash(newUser.password, salt, (error, hash) => {
						if(error) {
							req.flash('error_msg', 'Error saving user.');
							res.redirect('/');
						} else {
							newUser.password = hash;

							newUser.save().then(() => {
								req.flash('success_msg', 'User created successfully');
								res.redirect('/');
							}).catch(err => {
								req.flash('error_msg', 'Could not create the user.');
								res.redirect('/');
							});
						}
					});
				});
			}

		}).catch(err => {
			console.log(err);
			req.flash('error_msg', 'Could not search for user.');
		});
	}
});

router.get('/login', (req, res) => {
	res.render('user/login');
});

router.post('/login', passport.authenticate('local', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/user/login',
	failureMessage: true
}));

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'Goodbye! See you soon.');
	res.redirect('/');
});


/*
 * @param {string} somebody - Somebody's name.
*/
function yieldsSomebodysName(somebody) {
	console.log(somebody);
}

module.exports = router;