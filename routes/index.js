/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var _ = require('underscore'),
	keystone = require('keystone'),
	middleware = require('./middleware'),
	importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

keystone.pre('routes', middleware.parseBrastelUrl);
keystone.pre('routes', middleware.multilingual);
keystone.pre('render', middleware.postProcessView);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api')	
};

// Setup Route Bindings
exports = module.exports = function(app) {
	
	var express = keystone.express;
	//var app = express();
	var router = express.Router();
	
	app.all('/redirectme', function (req, res, next) {
		console.log('/redirectme route - Redirection required for passport users', req.url);
		if (req.user) {
			var cb = function () {
				var urlFrom = req.session.urlFrom;
				var url = urlFrom || '/admin';
				console.log('----- The user has been authenticated, go to:', url, urlFrom);
				res.redirect(url);
			};
			signinUser(req, res, req.user, cb);			
		}
		else{
			next();	
		}
	});
	
	
	app.all('*', function (req, res, next){
		if (res.locals.context){
			console.log('Multilingual context detected');
			var view = routes.views[res.locals.context.page];
			if (view) {		
				view(req, res, next);	
				return;
			}	
		}
		next();
	});
	
	//Views
	app.get('/', function (req, res, next) {
		res.redirect('/eng/home');
	});	
	
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);
	app.all('/mail', routes.views.testmail);
	
	app.all(/^\/(eng|jpn)\/howitworks/i, function(req, res, next){
		var re = /^\/(eng|jpn)/i;
 		if(re.test(req.url)){
        var language = re.exec(req.url)[1];
				app.use(express.cookieSession());
				req.session.language = language;
				routes.views.howitworks(req, res, next);
		}
	});

	
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	 app.all('/admin*', middleware.requireGoogleUser);
	 app.all('/admin*', routes.views.admin);
	 app.all('/signout', adminSignout);
	
	//app.all('/api/:lang/faq', routes.api.faq);	
	app.get('/api/item-categories', routes.api.itemCategories);	
	app.get('/api/item-categories/:category_id', routes.api.itemCategories);	

	//Etext items
	app.get('/api/items/:category_id/:index', routes.api.items.get);
	app.put('/api/items/:category_id/:index', routes.api.items.put);

	
	//used to get all translation items included in one page.
	//2 URL parameters: items [{}] and language
	app.get('/api/items', routes.api.getTranslations.apiRequest);
	
	
	//Languages
	app.get('/api/languages', routes.api.languages);
	
	//BLOG
	app.get('/api/blog/list/:language', keystone.initAPI, routes.api.blog.list);
	app.get('/api/blog/:id', keystone.initAPI, routes.api.blog.get);
	app.post('/api/blog/update/:id', keystone.initAPI, routes.api.blog.update);
	
	//FAQ
	app.get('/api/faq/list/:language', keystone.initAPI, routes.api.faq.list);
	app.get('/api/faq/:id', keystone.initAPI, routes.api.faq.get);
	//app.post('/api/blog/update/:id', keystone.initAPI, routes.api.blog.update);
	
	//USERS
	app.get('/api/currentuser', keystone.initAPI, function (req, res, next) {
		if (req.user) {
			res.apiResponse(req.user.toObject());
		} else {
			res.apiError('No user!');
		}
	});
	app.get('/api/user', keystone.initAPI, routes.api.user.list);
	app.put('/api/user/:id', keystone.initAPI, routes.api.user.save);
	app.post('/api/user', keystone.initAPI, routes.api.user.create);

	
};

function signinUser (req, res, user, onSuccess) {
	var urlFrom = req.session.urlFrom;
	req.session.regenerate(function() {
		req.session.urlFrom = urlFrom;
		req.user = user;
		req.session.userId = user.id;
		// if the user has a password set, store a persistence cookie to resume sessions
		if (keystone.get('cookie signin')) {
			var userToken = user.id + ':' + user.email;
			res.cookie('keystone.uid', userToken, { signed: true, httpOnly: true });
		}
		onSuccess(user);
	});	
}

function adminSignout (req, res) {
	var session = require('../node_modules/keystone/lib/session.js');
	var cb = function () {
		res.redirect('/');
	};
	session.signout(req, res, cb);
}
