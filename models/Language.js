var keystone = require('keystone'),
	Types = keystone.Field.Types;

var Language = new keystone.List('Language',{
	map: { name: 'text' },
	defaultSort: 'acr'
	//autokey: {path: 'slug', from: 'text', unique: true }
}
);

Language.add({
	acr: { type: Number, required: true, initial: true, index: true },
	alias: { type: String, required: true, initial: true },
	text: { type: String, required: true, initial: true },
	enabled: { type: Types.Boolean, index: true },
});

Language.relationship({ ref: 'BrastelPost', path: 'language' });



Language.defaultColumns = 'acr, alias, text, enabled';
Language.register();