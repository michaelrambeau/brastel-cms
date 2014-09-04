var keystone = require('keystone'),
	Types = keystone.Field.Types;

var Item = new keystone.List('Item');

Item.add({
	cat: {type: Number},
	index: {type: Number},
	comment: { type: String}
	//translations: { type: Array}
});

Item.schema.methods.getTranslation = function (languageId) {
	//From an item saved in the database, return the translation in the given language.
	//Used by /api/translations/<category_id> call
	var array = this.toObject().translations;
	var text = "";
	var language = (languageId) ? languageId : 4;
	array.forEach(function (translation) {
		if (translation.lang == language){
			text = translation.text;
		}
	});
	return text;	
};


Item.register();