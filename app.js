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

// Models
require('./models/Post');
const Post = mongoose.model('posts');

// Group routes
const admin = require('./routes/admin');

/* Configurations */

// Session
app.use(session({
	secret: 'adventuretime',
	resave: true,
	saveUninitialized: true
}));
app.use(flash());

// Middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
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
mongoose.connect('mongodb://localhost/blogapp').then(() => {
	console.log('Successfully connected to mongodb.');
}).catch(err => {
	console.log('Unable to connect to mongodb: ' + err);
});

// Public
app.use(express.static(path.join(__dirname, 'public')));

/* Routes */
app.get('/', (req, res) => {
	Post.find().populate("category").sort({creationDate: 'desc'}).lean().then(posts => {
		res.render('index', {posts: posts});
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Could not load posts');
	})
});

app.use('/admin', admin);

/* Application opening */
const PORT = 8081;
app.listen(PORT, () => {
	console.log('App running.');
});