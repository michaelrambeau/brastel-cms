var keystone = require('keystone');

exports = module.exports = function (req, res) {
	
	var locals = res.locals,
		view = new keystone.View(req, res);
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'about';
	
	if (false) view.on('init', function(next) {
		var t0 = new Date();
		var items = [];
		for (var i = 1; i < 30; i++){
			items.push({cat: 53, index: i});
		}
		var cb = function (array) {
			var t1 = new Date();
			console.log('--- ', items.length, 'items fetched in:', t1 - t0, 'ms ---');
			next();
		};
		require('../api/getTranslations').getListItemTranslation(items, 'eng', cb);					
	});	
	
	// Render the view
	view.render('about');
	
};