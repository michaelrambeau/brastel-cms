//From gist https://gist.github.com/JedWatson/9741171

var async = require('async'),
	keystone = require('keystone');
 
var FAQ = keystone.list('FAQ');

/**
 * List FAQ by language
 */
exports.list = function(req, res) {
	var language = req.params.language;
	console.log("Get FAQ list", language);
	FAQ.model.find({language: language})
		.populate('category')
		.sort({'category.position':1})
		.exec( function(err, items) {
			if (err) return res.apiError('database error', err);
			res.apiResponse({
				faqs: items
			});
		
	});
}
 
/**
 * Get FAQ by ID
 */
exports.get = function(req, res) {
	var id = req.params.id;
	console.log("Get 1 FAQ entry", id)
	FAQ.model.findById(id).exec(function(err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		res.apiResponse({
			faq: item
		});
		
	});
}
 
 
/**
 * Create a Post
 */
exports.create = function(req, res) {
	
	var item = new Post.model(),
		data = (req.method == 'POST') ? req.body : req.query;
	
	item.getUpdateHandler(req).process(data, function(err) {
		
		if (err) return res.apiError('error', err);
		
		res.apiResponse({
			post: item
		});
		
	});
}
 
/**
 * Get Post by ID
 */
exports.update = function(req, res) {
	Post.model.findById(req.params.id).exec(function(err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		var data = (req.method == 'POST') ? req.body : req.query;
		
		item.getUpdateHandler(req).process(data, function(err) {
			
			if (err) return res.apiError('create error', err);
			
			res.apiResponse({
				post: item
			});
			
		});
		
	});
}
 
/**
 * Delete Post by ID
 */
exports.remove = function(req, res) {
	Post.model.findById(req.params.id).exec(function (err, item) {
		
		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		item.remove(function (err) {
			if (err) return res.apiError('database error', err);
			
			return res.apiResponse({
				success: true
			});
		});
		
	});
}