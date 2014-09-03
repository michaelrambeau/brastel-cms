var keystone = require('keystone');

exports = module.exports = function (req, res) {
	
	var locals = res.locals,
		view = new keystone.View(req, res);
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	
	view.on('init', function(next) {
								
		keystone.list('Post').model.find({language: locals.context.language.value})
			.limit(10)
			.exec(function (err, docs) {
				if (err) throw err;
				locals.posts = docs;
				next();
			});
	});	
	
	// Render the view
	view.render('home');
	
};