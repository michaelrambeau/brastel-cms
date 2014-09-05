var keystone = require('keystone');
var _ = require("underscore");

var addMultilingualPath = function (fields) {
//Loop through the fields and create "field path" for all languages (body.eng, body.jpn...)

	var languages = keystone.get('languages');
	var defaultLanguage = 'eng';

	var fields2 = {};
	for (var prop in fields) {
		if(fields[prop].multilingual === true) {
			fields2[prop] = {};
			languages.forEach(function (lang) {
				fields2[prop][lang] = _.clone(fields[prop], null);//"shallow" copy
				if (lang != defaultLanguage) {
					fields2[prop][lang].required = false;
					fields2[prop][lang].initial = false;
				}
			});
		}
		else{
			fields2[prop] = fields[prop];
		}
	}
	return fields2;
};

var tools = {
	start: function () {
		//"Overwriting" the fields attribute of keystone.List add method.
		var orig = keystone.List.prototype.add;
		keystone.List.prototype.add = function () {
			var fields = arguments[0];
			fields = addMultilingualPath(fields);
			orig.apply(this, [fields]);
		};
	}
};

module.exports = tools;
