// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');

var session = require('./node_modules/keystone/lib/session.js');

//Plugins
var social = require('keystone-social-login');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({

	'name': 'My keystoneJS app 1',
	'brand': 'My keystoneJS app 1',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'jade',
	
	'emails': 'templates/emails',
	
	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
	'cookie secret': 'UiWW5hnkiRPGsyZBLtpRqJ24kd_Kgvz/_?~ol|y0bbC]^$wwET=M.9|pE?=vhB7['

});

//Set up social plugin
social.config({
    keystone: keystone,
    providers: {
        google: {
            clientID: '896333975843-qa875lefjsdhnd9a9304sdhhkm236uid.apps.googleusercontent.com',
            clientSecret: 'iQG_6K1dtluSqaueIAri8q5k'
        }
    },
		'auto create user': true
		/*onAuthenticate: function (req, accessToken, refreshToken, profile, done) {
			
		}*/
		/*,onAuthenticate: function(req, accessToken, refreshToken, profile, user, cb){
			console.log("postLogin callback");
			session.signinUser(req, user, cb);
		}*/
		
	
});

keystone.set('languages',
	 [
    {
			value: 'por',
			label: 'Portuguese'
		},
		{
			value: 'esp',
		 	label: 'ESPAÑOL'
		},
		{
			value: 'jpn',
		 	label: '日本語'
		},
		{
			value: 'eng',
			label: 'English'
		}
	 ]
)

// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});



// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

keystone.set('email locals', {
	logo_src: '/images/logo-email.gif',
	logo_width: 194,
	logo_height: 76,
	theme: {
		email_bg: '#f9f9f9',
		link_color: '#2697de',
		buttons: {
			color: '#fff',
			background_color: '#2697de',
			border_color: '#1a7cb7'
		}
	}
});

// Setup replacement rules for emails, to automate the handling of differences
// between development a production.

// Be sure to update this rule to include your site's actual domain, and add
// other rules your email templates require.

keystone.set('email rules', [{
	find: '/images/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/images/' : 'http://localhost:3000/images/'
}, {
	find: '/keystone/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/keystone/' : 'http://localhost:3000/keystone/'
}]);

// Load your project's email test routes

keystone.set('email tests', require('./routes/emails'));

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
	'posts': ['posts', 'post-categories'],
	'galleries': 'galleries',
	'enquiries': 'enquiries',
	'users': 'users',
	'languages': 'languages',
	'FAQ': 'FAQ',
	'Keyword lists': 'Keyword'	
});



keystone.set('signin redirect', '/redirectme');
social.start();

// Start Keystone to connect to your database and initialise the web server
keystone.start();
