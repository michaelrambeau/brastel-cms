var async = require('async'),
	keystone = require('keystone'),
	FAQ = keystone.list('FAQ'),
	Keyword = keystone.list('Keyword'),
	_ = require('underscore');

exports = module.exports = function (req, res) {
	var lang = req.params.lang;
	var fields = {
		category: 1
	};
	
	fields['title.' + lang] = 1;
	fields['body.' + lang] = 1;
	
	var options = {
		path: 'category',
		model: 'Keyword',
		select: {
			'text.eng': 1,
			_id: 0
		}
	};
	/*FAQ.model.find({}, fields, function (err, records) {
		if(err) throw err;
		FAQ.model.populate(records, options, function(err,result){
			res.json({
				success: true,
				language: lang,
				docs: result
			});				
		})

	});
	*/
	FAQ.model.find({}, fields)
		.populate('category')
		.exec(function(err, faqs){
			res.json({
				success: true,
				language: lang,
				docs: faqs
			});							
		})
		



};

function getFAQs(){
	var lang = req.params.lang;
	var fields = {
		category: 1
	};
	var categories = {};
	
	fields['title.' + lang] = 1;
	fields['body.' + lang] = 1;
	
	Keyword.model.find({category: "FAQCategory"}, function (err, records) {
		if(err) throw err;
		records.forEach(function (cat) {
			categories[cat._id] = cat.text[lang];
		});
		
		FAQ.model.find({}, fields, function (err, records) {
			if(err) throw err;
			var faqs = [];
			records.forEach(function (record, index) {
				var categoryTitle = categories[record.category];
				console.log(categoryTitle);
				var faq = record.toObject();
				faq.category = categoryTitle;
				faqs.push(faq);
			});
			console.log("cat", faqs[0].category);
			console.dir(faqs);
			
			res.json({
				success: true,
				language: lang,
				docs: faqs
			});
		});
		
	});
}