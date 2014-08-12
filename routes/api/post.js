var list;
var keystone = require('keystone');
exports = module.exports = function (req, res) {
	
	id = req.params.id;
	
	console.log("API - get one post", id);
	
	list = keystone.list('Post');
	list.model.findById(id)
		.exec(function(err, doc){
			if (err) throw err;
			res.json(doc);			
		});
}