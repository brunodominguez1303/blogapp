const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');

module.exports = {
	isAdmin: function(req, res, next) {
		
		User.findOne({_id: req.user.id}).then(user => {

			if(req.isAuthenticated() && user.isAdmin == 1) {
				return next();
			}
		});		

		/*req.flash('error_msg', 'Administration permissions needed.');
		res.redirect('/');*/
	}
}