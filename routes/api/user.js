/*
API calls to manage the user's list in Brastel Admin UI.
*/
var keystone = require('keystone');


/*
Get the user list
*/
module.exports.list = function (req, res) {
	var list = keystone.list('User');
	list.model.find()
		.exec(function(err, docs) {
			if (err) res.apiError(err);
			res.apiResponse({users: docs});
		});
};

/*
Save user languages (PUT request)
*/
module.exports.save = function (req, res) {
	var list = keystone.list('User');

	var id = req.params.id;
	var languages = req.body.languages;

	list.model.findById(id)
		.exec(function(err, doc) {
			if (err) res.apiError(err);
			if (!doc) res.apiError('Unable to find the user ' + id);
			doc.languages = languages;
			doc.save(function(err){
				if (err) res.apiError(err);
				res.apiResponse({'status':'OK'});
			});

		});
};

/*
Add a new user (POST request)
*/
module.exports.create = function (req, res) {
	var list = keystone.list('User');
	console.log('languages', req.body.languages);
	/*var data = {
		email: req.body.email,
	 	languages: JSON.parse(req.body.languages)
	};*/
	var data = req.body;

	var user = new list.model();
	console.log('Saving a new user', data);
	user.getUpdateHandler(req).process(data, function(err) {
		if (err) return res.apiError('DB error, unable to save the new user', err);
		res.apiResponse({
			user: user
		});

	});

};
