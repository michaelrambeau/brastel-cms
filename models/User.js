var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

//var social = require('keystone-social-login');

User.add({
	name: { type: Types.Name, required: false, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: false },
	creationDate: {type: Types.Datetime},
	lastUpdateDate: {type: Types.Datetime}
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

User.schema.add({
	languages: { type: [String] }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});


/**
 * Relationships
 */

User.relationship({ ref: 'Post', path: 'author' });

User.schema.pre('save', function(next) {
	if (!this.creationDate) {
		//First save => update creation timestap
		this.creationDate = new Date();
	} else {
		this.lastUpdateDate = new Date();
	}
	next();
});


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';


User.register();
