var list;
var keystone = require('keystone');
exports = module.exports = function (req, res) {
	
	cat = req.params.category_id;
	index = req.params.index;
	
	console.log("API - get a single item", cat, index);
	
	list = keystone.list('Item');
	list.model.findOne({cat: cat, index: index})
		.exec(function(err, docs){
			if (err) throw err;
			res.json(docs);			
		});
}
	
