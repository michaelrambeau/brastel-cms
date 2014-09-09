/*
API call to display the content of an etext item in all languages, in Brastel Admin UI.
*/
var list;
var keystone = require('keystone');

module.exports.get = function (req, res) {
	
	var cat = req.params.category_id;
	var index = req.params.index;
	cat = parseInt(cat, 10);
	
	console.log("API - get a single item", cat, index);
	
	var list1 = keystone.list('EtextCategory');
	list1.model.findOne({id: cat})
		.exec(function(err, doc){
			if (err) throw err;
			if (!doc) throw new Error('Unable to find the etext category ' + cat);
			var languages = doc.toObject().languages;

			var list2 = keystone.list('EtextItem');
			list2.model.findOne({cat: cat, index: index})
				.exec(function(err, item){
					if (err) throw err;
					if (!item) throw new Error('Unable to find the etext item ' + cat + ' ' + cat + ' ' + index);
					var doc = item.toObject();
					doc.languages = languages;
					res.json(doc);
				});
		});


};

module.exports.put = function (req, res) {
	//Update a translation in a given etext item

	var cat = req.params.category_id;
	var index = req.params.index;
	var text = req.body.text;
	var lang = req.body.language;

	if (lang == "comment"){
		updateEtextItemComment(cat, index, text, res);
	}
	else{
		updateEtextItem(cat, index, lang, text, res);
	}
};

function updateEtextItem(cat, index, language, text, res) {
	console.log("Update translation", cat, index, language, text);
	var query = {
		cat: cat,
		index: index
	};
	var update = {};
	update['text.' + language] = text;

	var list = keystone.list('EtextItem');
	list.model.findOneAndUpdate(query, update)
		.exec(function (err, doc) {
			if (err) throw(err);
			res.json(doc);
		});
}

function updateEtextItemComment(cat, index, text, res) {
	console.log("Update comment", cat, index, text);
	var query = {
		cat: cat,
		index: index
	};
	var update = {
		comment: text
	};

	var list = keystone.list('EtextItem');
	list.model.findOneAndUpdate(query, update)
		.exec(function (err, doc) {
			if (err) throw(err);
			res.json(doc);
		});
}
