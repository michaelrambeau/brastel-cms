var keystone = require('keystone'),
	Types = keystone.Field.Types;
	tools = require('../multilingual');

var FAQ = new keystone.List('FAQ', {
	//map: { name: 'title.' + tools.defaultLanguage }
	map: { name: 'title'}
});

var fields = {
	language: { type: Types.Select, options: keystone.get('languages'), initial: true },
	category: { type: Types.Relationship, ref: 'Keyword', filters: { category: 'FAQCategory' }, initial: true},
	number: { type: Number, required: true, initial: true },
	title: { type: String, multilingual: false, required: true, initial: true },
	body:  {type: Types.Html, multilingual: false, wysiwyg: true, height: 200}
};

FAQ.add(tools.addMultilingualPath(fields));

//FAQ.defaultColumns = 'number, category, title.' + tools.defaultLanguage;
FAQ.defaultColumns = 'category, number, title';
FAQ.register();
