const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('categories');
require('../models/Post');
const Post = mongoose.model('posts');
const {isAdmin} = require('../helpers/isAdmin');

/* INDEX FOR ADMIN PAGE */
router.get('/', isAdmin, (req, res) => {
	res.render('admin/index');
});

/* LIST OF POSTS */
router.get('/posts', isAdmin, (req, res) => {
	Post.find().lean().then((posts) => {
		res.render('admin/posts', {posts: posts});
	});
});

/* POST PAGE */
router.get('/post/:id', isAdmin, (req, res) => {
	Post.findOne({_id: req.params.id}).lean().then(post => {
		res.render('admin/viewpost', {post: post});
	});
	
});

/* FORM ADD POST ROUTE */
router.get('/posts/add', isAdmin, (req, res) => {
	Category.find().lean().then(categories => {
		res.render('admin/addpost', {categories: categories});
	}).catch(err => {
		req.flash('error_msg', 'Error loading form.');
		res.redirect('/admin');
	});	
});

/* SAVE CREATED POST INTO DATABASE */
router.post('/posts/new', isAdmin, (req, res) => {
	const newPost = {
		title: req.body.title,
		slug: req.body.slug,
		description: req.body.description,
		content: req.body.content,
		category: req.body.category
	}

	new Post(newPost).save().then(() => {
		req.flash('success_msg', 'successfully created post.');
		res.redirect('/admin/posts');
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'could not save the post. try again.');
		res.redirect('/admin/posts');
	});
});

/* EDIT POST */
router.get('/post/edit/:id', isAdmin, (req, res) => {
	
	Post.findOne({_id: req.params.id}).lean().then(post => {
		Category.find().lean().then(categories => {
			res.render('admin/editpost', {
				categories: categories,
				post: post,
			});
		}).catch(err => {
			console.log(err);
			req.flash('error_msg', 'Could not retrieve categories from db');
			res.redirect('/admin/posts');
		});
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Problem loading the edit form.');
		res.redirect('/admin/posts');
	});
});

/* SAVE EDITED POST INTO DATABASE */
router.post('/post/edit', isAdmin, (req, res) => {
	Post.findOne({_id: req.body.id}).then(post => {

		post.title = req.body.title;
		post.slug = req.body.slug;
		post.description = req.body.description;
		post.content = req.body.content;
		post.category = req.body.category;

		post.save().then(() => {
			req.flash('success_msg', 'Post saved successfully.');
			res.redirect(`/admin/post/${post._id}`);
		}).catch(err => {
			console.log(err);
			req.flash('error_msg', 'Unable to save the post.');
			res.redirect('/admin/posts');
		});

	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Could not find the post.');
		res.redirect('/admin/posts');
	});
});

/* DELETE POST */
router.post('/posts/delete', isAdmin, (req, res) => {
	Post.remove({_id: req.body.id}).then(() => {
		req.flash('success_msg', 'Post deleted.');
		res.redirect('/admin/posts');
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Error deleting the post.');
		res.redirect('/admin/posts');
	});
});


/* LIST OF CATEGORIES */
router.get('/categories', isAdmin, (req, res) => {

	Category.find().lean().then(categories => {
		res.render('admin/categories', {categories: categories});
	}).catch(err => {
		req.flash('error_msg', 'There was a problem listing the categores.');
	});
});

/* FORM TO ADD A CATEGORY */
router.get('/categories/add', isAdmin, (req, res) => {
	res.render('admin/addcategory');
});

/* POST ROUTE TO SAVE CATEGORY INTO DATABASE */
router.post('/categories/new', isAdmin, (req, res) => {

	// ERROR HANDLER
	var errors = [];

	if(!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
		console.log(req.body.name);
		errors.push({text: 'Fill the name correctely.'});
	}

	if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
		errors.push({text: 'Fill the slug correctely.'});
	}

	// SHOWS ERRORS OR ADD NEW CATEGORY TO DATABASE
	if(errors.length > 0) {
		res.render('admin/addcategories', {errors: errors});
	} else {
		const newCategory = {
			name: req.body.name,
			slug: req.body.slug
		};

		new Category(newCategory).save().then(() => {
			req.flash('success_msg', 'Category successfully created!');
			res.redirect('/admin/categories');
		}).catch(err => {
			req.flash('error_msg', 'Unable to create and save the category.');
			res.redirect('/admin/categories');
		});
	}
});

/* FORMS TO EDIT A CATEGORY */
router.get('/categories/edit/:id', isAdmin, (req, res) => {
	Category.findOne({_id:req.params.id}).lean().then(category => {
		res.render('admin/editcategory', {category: category});	
	}).catch(err => {
		req.flash('error_msg', 'The category doesn\'t exists.');
		res.redirect('/admin/categories');
	});
	
});

/* SAVE EDITED CATEGORY INTO DATABASE */
router.post('/categories/edit', isAdmin, (req, res) => {
	// ERROR HANDLER
	var errors = [];

	if(!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
		console.log(req.body.name);
		errors.push({text: 'Fill the name correctely.'});
	}

	if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
		errors.push({text: 'Fill the slug correctely.'});
	}

	// SHOWS ERRORS OR SAVE CATEGORY TO DATABASE
	if(errors.length > 0) {
		res.render('admin/addcategories', {errors: errors});
	} else {
		Category.findOne({_id: req.body.id}).then(category => {

			category.name = req.body.name;
			category.slug = req.body.slug;

			category.save().then(() => {
				req.flash('success_msg', 'Category successfully updated.');
				res.redirect('/admin/categories');
			}).catch(err => {
				console.log(err);
				req.flash('error_msg', 'Not able to save edited category in db.');
				res.redirect('/admin/categories');
			});

		}).catch(err => {
			console.log(err);
			req.flash('error_msg', 'Problem editing category.');
			res.redirect('/admin/categories');
		});
	}
});

/* DELETE CATEGORY */
router.post('/categories/delete', isAdmin, (req, res) => {
	Category.remove({_id: req.body.id}).then(() => {
		req.flash('success_msg', 'Category deleted with success.');
		res.redirect('/admin/categories');
	}).catch(err => {
		console.log(err);
		req.flash('error_msg', 'Problem deleting category.');
		res.redirect('/admin/categories');
	});
});

module.exports = router;