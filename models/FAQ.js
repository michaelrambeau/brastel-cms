console.log("FAQ model... start!",__dirname);
var keystone = require('keystone'),
	Types = keystone.Field.Types;
	tools = require('../multilingual');

var FAQ = new keystone.List('FAQ', {
	map: { name: 'title.' + tools.defaultLanguage }
});

var fields = {
	category: { type: Types.Relationship, ref: 'Keyword', filters: { category: 'FAQCategory' }, initial: true},
	number: { type: Number, required: true, initial: true },
	title: { type: String, multilingual: true, required: true, initial: true },
	body:  {type: Types.Html, multilingual: true, wysiwyg: true, height: 200}
};

FAQ.add(tools.addMultilingualPath(fields));

FAQ.defaultColumns = 'number, category, title.' + tools.defaultLanguage;
FAQ.register();
