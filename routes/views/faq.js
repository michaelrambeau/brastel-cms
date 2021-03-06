var keystone = require('keystone');

/**
Sort an array of FAQ by category and by number (inside the category)
Cannot be done automatically bu MongoDB by using a sort() instruction because
category data is retrieved with a populate() instruction.
*/
function sortByCategory(faqs) {
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

/**
Return the array of FAQ categories sent to the browser.
Each category contains an array of FAQ.
*/
function getCategories (faqs, language) {
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
		if (key !== current) {
			current = key;
			categories.push({
				value: key,
				text: faq.toObject().category.text[language],
				faqs: [content]
			});
		} else {
			categories[categories.length - 1].faqs.push(content);
		}	
	});
	return categories;
}
	
module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	var language = req.session.language;
	
	locals.section = 'faq';
	
	view.on('init', function(next) {
								
		keystone.list('FAQ').model.find({language: locals.context.language.value})
			.populate('category')
			.exec(function (err, docs) {
				if (err) throw err;
				var faqs = sortByCategory(docs);
				var categories = getCategories(faqs, language);
				locals.categories = categories;
				next();
			});
	});
	view.render('faq');
};
