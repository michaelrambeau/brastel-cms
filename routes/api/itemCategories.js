var list;
var keystone = require('keystone');
exports = module.exports = function (req, res) {
	
	var category = req.params.category_id;
	var language = req.param("language");
	
	if (category === undefined) {
		//Return all item categories
		list = keystone.list('EtextCategory');
		list.model.find({})
			.sort({title: 1})
			.exec(function(err, docs){
				res.json(docs);			
			});
	}
	
	else {
		//Return the list of items of a given category	
		list = keystone.list('EtextItem');
		getItemList(parseInt(category,10), language, function (docs) {
			res.json(docs);
		});
	}
	
};

function getItemList(category, language, cb){
	
	list = keystone.list('EtextItem');
	list.model.find({cat: category})
		.sort({index: 1})
		.exec(function(err, docs) {
			if (err) throw(err);
			var result = [];
			docs.forEach(function (doc) {
				result.push({
					cat: doc.cat,
					index: doc.index,
					text: doc.getTranslation(language)
				});
			});
			cb(result);
		});
}
