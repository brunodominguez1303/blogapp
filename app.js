/* Loading modules */

// Frameworks and helpers
const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('./config/auth')(passport);
const db = require('./config/db');

// Models
require('./models/Post');
const Post = mongoose.model('posts');
require('./models/Category');
const Category = mongoose.model('categories');
require('./models/User');
const User = mongoose.model('users');

// Group routes
const admin = require('./routes/admin');
const user = require('./routes/user');

/* Configurations */

// Session
app.use(session({
	secret: 'adventuretime',
	resave: true,
	saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
/*app.use(passport.authenticate('session'));*/

// Middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Handlebars
app.engine('.handlebars', engine({defaultLayout: 'main'}));
app.set('view engine', '.handlebars');
app.set('views', './views');

// Mongoose
mongoose.connect(db.mongoURI).then(() => {
	console.log('Successfully connected to mongodb.');
	console.log(db.mongoURI);
}).catch(err => {
	console.log('Unable to connect to mongodb: ' + err);
});

// Public
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/* Routes */
app.get('/', (req, res) => {
	Post.find().populate("category").sort({creationDate: 'desc'}).lean().then(posts => {
		res.render('index', {posts: posts});
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Could not load posts');
	})
});

app.get('/posts', (req, res) => {
	Post.find().lean().then(posts => {
		User.findOne({_id: req.user.id}).lean().then(user => {
			res.render('post/posts', {posts: posts, user: user});
		});
		
	});
});

app.get('/post/:id', (req, res) => {
	Post.findOne({_id: req.params.id}).lean().then(post => {
		if(post) {
			res.render('post/index', {post: post});
		} else {
			req.flash('error_msg', 'This post doesn\'t exists');
			res.redirect('/');
		}
	}).catch(err => {
		req.flash('error_msg', 'Couldn\'t load the post');
		res.redirect('/post');
	});
});

app.get('/categories', (req, res) => {
	Category.find().lean().then(categories => {
		res.render('category/index', {categories: categories});
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Problem loading the categories.');
		res.redirect('/');
	});
});

app.get('/categories/:id', (req, res) => {
	Category.findOne({_id: req.params.id}).lean().then(category => {
		if(category) {
			Post.find({category: category._id}).lean().then(posts => {

				res.render('category/posts', {
					posts: posts,
					category: category
				});

			}).catch(err => {
				req.flash('error_msg', 'Unable to load posts.');
				res.redirect('/categories');
			})
		} else {
			req.flash('error_msg', 'Category doens\'t exists.');
			res.redirect('/categories');
		}
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Could not load the posts from category.');
		res.redirect('/categories');
	});
});

app.use('/admin', admin);
app.use('/user', user);

/* Application opening */
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log('App running.');
});