const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('categories');
require('../models/Post');
const Post = mongoose.model('posts');

/* INDEX FOR ADMIN PAGE */
router.get('/', (req, res) => {
	res.render('admin/index');
});

/* LIST OF POSTS */
router.get('/posts', (req, res) => {
	Post.find().then((posts) => {
		res.render('admin/posts', {
			posts: posts,

			helpers: {
				getId(post) {
					return post._id;
				},
				getTitle(post) {
					return post.title;
				},
				getDescription(post) {
					return post.description;
				},
				getCategory(post) {
					return post.category;
				}
			}
		});
	});
	
});

router.get('/posts/add', (req, res) => {
	Category.find().then(categories => {
		res.render('admin/addposts', {
			categories: categories,

			helpers: {
				getId(category) {
					return category._id;
				},
				getName(category) {
					return category.name;
				}
			}
		});
	}).catch(err => {
		req.flash('error_msg', 'Error loading form.');
		res.redirect('/admin');
	});	
});

router.post('/posts/new', (req, res) => {
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



/* LIST OF CATEGORIES */
router.get('/categories', (req, res) => {

	Category.find().then(categories => {
		res.render('admin/categories', {
			categories: categories,

			helpers: {
				showName(category) {
					return category.name;
				},
				showSlug(category) {
					return category.slug;
				},
				showId(category) {
					return category._id;
				}
			}
		});
	}).catch(err => {
		req.flash('error_msg', 'There was a problem listing the categores.');
	});
});

/* FORM TO ADD A CATEGORY */
router.get('/categories/add', (req, res) => {
	res.render('admin/addcategories');
});

/* POST ROUTE TO SAVE CATEGORY INTO DATABASE */
router.post('/categories/new', (req, res) => {

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
router.get('/categories/edit/:id', (req, res) => {
	Category.findOne({_id:req.params.id}).then(category => {
		res.render('admin/editcategories', {
			
			helpers: {
				showName() {
					return category.name;
				},
				showSlug() {
					return category.slug;
				},
				showId() {
					return category._id;
				}
			}
		});	
	}).catch(err => {
		req.flash('error_msg', 'The category doesn\'t exists.');
		res.redirect('/admin/categories');
	});
	
});

/* SAVE EDITED CATEGORY INTO DATABASE */
router.post('/categories/edit', (req, res) => {
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

router.post('/categories/delete', (req, res) => {
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