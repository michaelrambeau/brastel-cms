var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Post.add({
	title: { type: String, required: true },
	language: { type: Types.Relationship, ref: 'Language', many: false, initial: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	body:  {type: Types.Html, wysiwyg: true, height: 400}
	
});

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

Post.defaultColumns = 'title, language, status';
Post.register();
