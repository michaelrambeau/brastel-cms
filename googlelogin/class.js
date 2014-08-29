var passport = require('passport');
var _ = require('underscore');

function GoogleLogin (keystone, options) {
	
	/*if (!(this instanceof GoogleLogin)) {
		return new GoogleLogin(keystone);
	}*/	
	this.keystone = keystone;
	this.options = options;
	console.log('--- GoggleLogin constructor ---');
}

var methods = GoogleLogin.prototype;

methods.init = require('./init.js');

methods.start = function() {
	console.log('--- GoggleLogin start() ---');
	var _this = this;
	
	var provider = require('./google.js');
	
	this.updateUserModel();
	
	this.init(provider);
	
	// get the app and the routes
	app = this.keystone.app;
	routes = this.keystone.get('routes');		

	// initialize passport
	this.keystone.pre('routes', passport.initialize());
	this.keystone.pre('routes', passport.session());
	

	
	if (true) this.keystone.set('routes', function() {
		
		//app.get('/social/login', _this.__login.bind(_this));
		app.get(provider.options.url.login, passport.authenticate(provider.name));		
		
		app.get(provider.options.url.callback, function(req, res, next) {
			passport.authenticate(provider.name, function(err, user) {
			
				// fix for Twiter non-standard response
				if (req.query.denied) {
					req.query.error = 'access_denied';
				}
				if (req.query.error) {
					req.flash('error', _this.getErrorMessage (req.query.error));
					return res.redirect(_this.options.signinUrl); 
				}	

				// check for other errors
				if (err) { 
					return next(err); 
				}

				// check if user was found
				if (!user) { 
					req.flash('error', 'Unable to find user.');
					return res.redirect(_this.options.signinUrl); 
				}

				// attempt to log in user
				req.logIn(user, function(err) {
					if (err) { 
						return next(err); 
					}
					var signInRedirect = _this.keystone.get('signin redirect') || '/keystone';
					return res.redirect(signInRedirect);
				});

			})(req, res, next);
		});	//app.get(...url.callback)
		
		// configure application routes
		if (_.isFunction(routes)) {
			routes.call(this.keystone, app);
		}
		
	});			
};

methods.getErrorMessage = function (error) {
	// check for error responses, flash and redirect
	switch(error) {
		case 'invalid_request':
			return 'User refused to grant access.';
		case 'invalid_client':
			return 'The client identifier provided is invalid.';
		case 'unauthorized_client':
			return 'The client is not authorized to use the requested response type.';
		case 'redirect_uri_mismatch':
			return 'The redirection URI provided does not match a pre-registered value.';
		case 'access_denied':
			return 'The end-user or authorization server denied the request.';
		case 'unsupported_response_type':
			return 'The requested response type is not supported by the authorization server.';
		case 'invalid_scope':
			return 'The requested scope is invalid, unknown, or malformed.';
		case 'application_suspended':
			return 'OAuth application has been suspended.';
	}	
}

methods.updateUserModel = function () {
	var list = this.keystone.list('User');
	var passwordField = list.schema.paths.password;
	passwordField.options.required = false;
	passwordField.isRequired = false;
}

module.exports = GoogleLogin;
	