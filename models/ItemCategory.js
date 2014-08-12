var keystone = require('keystone'),
	Types = keystone.Field.Types;

var ItemCategory = new keystone.List('ItemCategory');

ItemCategory.add({
	id: { type: String, required: true },
	title: { type: String, required: true }
});


ItemCategory.register();
