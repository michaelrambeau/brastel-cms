var keystone = require('keystone'),
	async = require('async'),
	request = require('request');



exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	var language = req.session.language;
	
	// Set locals
	locals.section = 'faq';
	
	if (false) view.on('get', function(next, data) {
    console.log("View 'get' event", data);
		next();
	});
	
	view.on('init', function(next) {
		
		var items = [];
		
		locals.translate = function (item) {
			console.log("Add a new item to translate later", item);
			items.push(item);
			req.items = items;
			return "here I am!";
		}		
				
		var templateData = {
			title: 'FAQ',
			introduction: 'The list of FAQs...'
		}
		locals.templateData = templateData;		
		
		next();
		
		
		
		
/*		if (false) request('http://localhost:3000/api/eng/faq', function (error, response, body) {
			if (error) throw error;
			if (response.statusCode != 200) throw new Error("Invalid response status code");
			
			var templateData = {
				title: 'FAQ',
				introduction: 'The list of FAQs...'
			}
			locals.templateData = templateData;

			console.log("View 'init' event");
			next();					
		})		*/
		

	});
			
	// Render the view
	console.log("Render...");
	view.render('faq')
	
};
