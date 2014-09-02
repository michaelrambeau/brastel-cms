var keystone = require('keystone');

function getListItemTranslation(items, language, cb) {
	//Return the translations for an array of items {cat, index}, in a given language
	
	var docSearch = {"$or": items};
	var array = {};
	
	var list = keystone.list('Item');
	list.model.find(docSearch)
		.exec(function (err, docs) {
			if (err) {
				throw err;
			}
			docs.forEach(function (item) {
				var text = item.getTranslation(language);
				array[item.cat + "/" + item.index] = text;
			});
			cb(array);
			
		});
}

module.exports.apiRequest = function (req, res) {

	var items = JSON.parse(req.param("items"));
	var language = parseInt(req.param("language"), 10);
	
	console.log("API - get a set of etext items...", language, items.length);
	
	getListItemTranslation(items, language, function (translations) {
		res.json({"translations": translations});
	});
	
};

module.exports.getListItemTranslation = getListItemTranslation

