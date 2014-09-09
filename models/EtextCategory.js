var keystone = require('keystone'),
	Types = keystone.Field.Types;

var EtextCategory = new keystone.List('EtextCategory');

EtextCategory.add({
	id: { type: Types.Number, required: true, initial: true, index: true },
	title: { type: String, required: true, initial: true }
});


EtextCategory.register();
