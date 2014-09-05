var keystone = require('keystone'),		
		Types = keystone.Field.Types,
		tools = require('../multilingual');		

var Keyword = new keystone.List('Keyword', {
	map: { name: 'text.eng' }
});

var fields={
	category: { type: Types.Select, options: 'FAQCategory, BlogCategory, Country', index: true, initial: true },
	position: { type: Types.Number, required: true,initial: true },
	value: { type: String, required: true,initial: true },
	text: { type: String, required: true, initial:true, multilingual: true }
};

Keyword.add(fields);

Keyword.defaultColumns = 'category, position, value, text.eng';
Keyword.register();
