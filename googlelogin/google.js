/**
 * Google provider default settings
 * @type {Object}
 */
var provider = {
	name: 'google',
	strategy: {
		module: 'passport-google-oauth',
		method: 'OAuth2Strategy'
	},
	settings:	{
		clientID:	'clientID',
		clientSecret:	'clientSecret'
	},
	options: {
		clientID: '896333975843-qa875lefjsdhnd9a9304sdhhkm236uid.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_KEY,
		url: {
			login: '/social/google/login',
			callback: '/social/google/callback'		
		},
		additional: {
			scope: ['profile', 'email']
		}
	},
	loginId: { name: 'email', label: 'Google E-Mail' },
	parseProfile: function(jsonProfile) {
		return {
			id: jsonProfile.id,
			email: jsonProfile.email,
			name: jsonProfile.name,
			photoUrl: jsonProfile.picture,
			profileUrl: jsonProfile.link
		};
	}
};

module.exports = provider;
