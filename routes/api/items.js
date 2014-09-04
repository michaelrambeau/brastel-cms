/*
API call to display the content of an etext item in all languages, in Brastel Admin UI.
*/
var list;
var keystone = require('keystone');
exports = module.exports = function (req, res) {
	
	var cat = req.params.category_id;
	var index = req.params.index;
	
	console.log("API - get a single item", cat, index);
	
	list = keystone.list('EtextItem');
	list.model.findOne({cat: cat, index: index})
		.exec(function(err, docs){
			if (err) throw err;
			res.json(docs);			
		});
};