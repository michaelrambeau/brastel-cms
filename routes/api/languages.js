var list;
var keystone = require('keystone');
exports = module.exports = function (req, res) {
	
	var languages = keystone.get("languages");//defined in /keystone.js
	res.json(languages);
	return;
	
	cat = req.params.category_id;
	index = req.params.index;
	
	console.log("API - get languages");
	
	list = keystone.list('Language');
	list.model.find({})
		.exec(function(err, docs){
			if (err) throw err;
			res.json(docs);			
		});
}