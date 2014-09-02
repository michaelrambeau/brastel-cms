var keystone = require('keystone'),
	async = require('async'),
	request = require('request'),
	_ = require('underscore');



exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	var language = req.session.language;
	
	locals.section = 'faq';
	
	view.on('init', function(next) {
		
		if (false) keystone.list('Keyword').model.find({category: 'FAQCategory'})
			.sort({position: 1})
			.exec(function (err, docs) {
				if (err) throw err;
				locals.categories = docs;
				next();		
			})
						
		if (true) keystone.list('FAQ').model.find({language: locals.context.language.value})
			.populate('category')
			.sort({'category.position':1})		
			.exec(function (err, docs) {
				if (err) throw err;
				var faqs = sortByCategory(docs);
				var categories = getCategories(faqs);
				locals.categories = categories;
				next();		
			})
		

	});
			
	// Render the view
	console.log("Render...");
	view.render('faq');
};

function sortByCategory (faqs) {
	//sort by "FAQ Category position"...
	var getPosition = function (faq) {
		return faq.category.position;
	};
	//and by FAQ number
	var getNumber = function (faq) {
		return faq.number;
	};
			
	faqs.sort(function (x, y) {
		var delta = getPosition(x) - getPosition(y);
		if (delta === 0) delta = getNumber(x) - getNumber(y);
		return delta;
	});
	return faqs;
}

function getCategories (faqs) {
	var key = '',
			current = '',
			categories = [];
	faqs.forEach(function (faq) {
		key = faq.category.value;
		var content = {
			number: faq.number,
			title: faq.title,
			body: faq.body			
		};
		if (key != current){
			current = key;
			categories.push({
				value: key,
				text: faq.category.text.eng,
				faqs: [content]
			})
		}
		else {
			categories[categories.length - 1].faqs.push(content);
		}			
	});
	return categories;
}