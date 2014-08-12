var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {
	
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	var language = req.session.language;
	
	// Set locals
	locals.section = 'howitworks';
	
	view.on('init', function(next) {
		
		var q = keystone.list('SitePage').model.findOne({
				key: 'howitworks'
		});
		
		q.lean().exec(function(err, doc) {
			if (doc == null) throw new Error("No templateData document found!");
			var content = doc.content;
			console.log("content=", content);
			var templateData = {}
			for(var key in content){
				console.log(key, '=',content[key][language]);
				templateData[key] = content[key][language];
			}	
			
			locals.templateData = templateData;
			next(err);
		});
		
	});	
	
	
	
	
	// Render the view
	view.render('howitworks');
	
};
