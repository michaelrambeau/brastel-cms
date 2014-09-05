var keystone = require('keystone'),
	Types = keystone.Field.Types;

var EtextItem = new keystone.List('EtextItem');

EtextItem.add({
	cat: {type: Number, index: true},
	index: {type: Number, index: true},
	comment: { type: String},
	text: {type: Types.Html, multilingual: true}
});

EtextItem.schema.methods.getTranslation = function (language) {
	//From an item saved in the database, return the translation in the given language ('eng' for example).
	//Used by /api/translations/<category_id> call
	var translations = this.toObject().text;
	var text = translations[language] || '';
	return text;	
};


EtextItem.register();
