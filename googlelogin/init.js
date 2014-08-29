/**
 * init.js
 * plugin initialization
 */
var _ = require('underscore'),
	passport = require('passport'),
	path = require('path');

/**
 * passport strategy setup for authentication provider
 * @param {object} options - providerstrategy ptions
 */
function setup(provider) {
	var _this = this,
		settings = {
			callbackURL: provider.options.url.callback,
			passReqToCallback: true
		},
		Strategy = require(provider.strategy.module)[provider.strategy.method];

	// set provider clientID/clientSecret
	settings[provider.settings.clientID] = provider.options.clientID;
	settings[provider.settings.clientSecret] = provider.options.clientSecret;

	// if there are any additional custom settings add them as well
	if (provider.options.additional && _.isObject(provider.options.additional)) {
		_.extend(settings, provider.options.additional);
	}

	// build passport authentication function	
	var authenticate = function authenticate(req, accessToken, refreshToken, profile, done) {
		var callback = null;//_this.get('onAuthenticate'),
			parsedProfile = provider.parseProfile(profile._json);

		// cal user-defined callback if one exists
		if (false && _.isFunction(callback)) {
			callback.call(req, accessToken, refreshToken, profile, done);
			return;
		}
		console.log("-------------- Authenticated from passport !---------------");
		// TODO: finish authenticate function

		process.nextTick(function() {
			var User = _this.keystone.list(_this.keystone.get('user model')).model,
				profileId = 'social.' + provider.name + '.id',
				profileLoginId = provider.name + 'LoginId',
				queryProfileId = {},
				queryLoginId = {};

			// build profile id query
			queryProfileId[profileId] = parsedProfile.id;

			// build profile login id query (case-insensitive)
			queryLoginId[profileLoginId] = { $regex: profile._json[provider.loginId.name], $options: '-i' };

			// try to find the user based on their profile id or login id
			User.findOne({ $or: [ queryProfileId, queryLoginId ] }, function(err, user) {
				// if something went wrong just return the error
				if (err) {
					return done(err);
				}

				// if not found and 'auto create user' is not true then just return
				if (!user && !_this.options.autoCreateUser) {
					return done();
				} 

				// create new user if not found and 'auto create user' is true
				if (!user) {
					user = new User();

					// if user schema has an email field and so does the provider's profile then save it
					if (user.schema.path('email') && parsedProfile.email) {
						user.set('email', parsedProfile.email);
					}

					// if user schema has a name field and so does the provider's profile then save it
					if (user.schema.virtual('name.full') && parsedProfile.name) {
						user.set('name.full', parsedProfile.name);
					}

					// set the profile login id
					user.set(profileLoginId, profile._json[provider.loginId.name]);
				}
				
				// set all of the relevant information
				user.set('social.' + provider.name + '.id', parsedProfile.id);
				user.set('social.' + provider.name + '.name', parsedProfile.name);
				user.set('social.' + provider.name + '.email', parsedProfile.email);
				user.set('social.' + provider.name + '.photoUrl', parsedProfile.photoUrl);
				user.set('social.' + provider.name + '.profileUrl', parsedProfile.profileUrl);
				user.set('social.' + provider.name + '.accessToken', accessToken);
				user.set('social.' + provider.name + '.refreshToken', refreshToken);
				//user.set('lastLogin', new Date());

				// save the user
				console.dir(user);
				user.save(function(err) {
					if (err) console.log('Unable to save the user.', err);
					return done(err, user);	
				});

			});
		});
	};

	// configure passport with this provider/strategy
	passport.use(new Strategy(settings, authenticate));
}

/**
 * initialize plugin and hook itself into keystone
 * @api	public
 */
var init = function init(provider) {
	var _this = this;
		
	if (!_.isObject(this.keystone)) {
		this.__error('Configuration missing "keystone" object', 'ConfigError');
	}

	// hijack keystone login, but save it for use later
	this.__signinUrl = this.keystone.get('signin url') || '/keystone/signin';
	this.keystone.set('signin url', this.options.signinUrl);

	// configure passport serialization/deserialzation functions
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		var User = _this.keystone.list(_this.keystone.get('user model')).model;

		User.findById(id).exec(function(err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			return done(null, user);
		});
	});

	// set up each configured provider
	setup.call(_this,provider);

};

module.exports = init;
