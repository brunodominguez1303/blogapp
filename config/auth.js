const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// user model
require('../models/User');
const User = mongoose.model('users');

module.exports = function (passport) {
	passport.use(new LocalStrategy({usernameField: 'email'}, function verify(email, password, done) {
		User.findOne({email: email}).then(user => {

			if(!user) { return done(null, false); }

			bcrypt.compare(password, user.password, (error, same) => {

				if(error) { return done(error); }

				if(same) { return done(null, user); }

				return done(null, false, {message: 'Invalid password'});
			});
		}).catch(err => {
			console.log(err);
			req.flash('error_msg', 'Could not query into database.');
			res.redirect('/');
		});
	}));

	/* store information about the user into the session */
	passport.serializeUser((user, done) => {
		process.nextTick(() => {
			done(null, {id: user.id, email: user.email});
		});
	});

	passport.deserializeUser((user, done) => {
		process.nextTick(() => {
			return done(null, user);
		})
	});
}