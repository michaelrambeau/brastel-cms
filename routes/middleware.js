/**
 * This file contains the common middleware used by your routes.
 * 
 * Extend or replace these functions as your application requires.
 * 
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require('underscore'),
	querystring = require('querystring'),
	keystone = require('keystone');

var cheerio = require('cheerio');
var request = require('request');
var urlModule = require('url');


/**
	Initialises the standard view locals
	
	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {
	var previous = req.session.regenerate;
	req.session.regenerate = function () {
		console.log("--- before regeneration ---");//mike
		return previous.apply(this, arguments);
	}	
	var locals = res.locals;
	
	locals.navLinks = [
		{ label: 'Home',		key: 'home',		href: '/' },
		{ label: 'Blog',		key: 'blog',		href: '/blog' },
		{ label: 'Gallery',		key: 'gallery',		href: '/gallery' },
		{ label: 'Contact',		key: 'contact',		href: '/contact' },
		{ label: 'How it works',		key: 'howitworks',		href: '/eng/howitworks' },
		{ label: 'FAQ',		key: 'faq',		href: '/eng/faq' }		
	];
	locals.user = req.user;
	locals.authUser = req.session.auth;
	
	next();
	
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {
	
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
	
	next();
	
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
	var url = urlModule.parse(req.originalUrl).path;
	console.log('requiredUser in routes/middleware.js', req.user, req.originalUrl);
	req.session.urlFrom = url;
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		//res.redirect('/keystone/signin');
		res.redirect('/social/login');//mike
	} else {
		res.locals.user = req.user;
		next();
	}
	
};


exports.postProcessView = function(req, res, next) {
	//from this Gist https://gist.github.com/mrlannigan/5051687
	
	
	console.log("postProcessView middleware...");
  var render = res.render;
  res.render = function(view, options, fn) {
    var self = this,
      options = options || {},
      req = this.req,
      app = req.app,
      defaultFn;
 
    if ('function' == typeof options) {
      fn = options, options = {};
    }
 
    defaultFn = function(err, str){
      if (err) return req.next(err);
      self.send(str);
    };
 
    if ('function' != typeof fn) {
      fn = defaultFn;
    }
 		
    render.call(self, view, options, function(err, str) {
			var items = req.items;		
			console.log("Overwriting render...", items);
      if (items == undefined) {
				//No item to translate in the page.
				console.log("Nothing to translate!");
				self.send(str);	
				return false;
			}
			
			//Request the translations, calling the API.
			getTranslations(items, function(result){
				console.log("translations OK!", JSON.parse(result).translations);
				var html = insertHtml(str, JSON.parse(result).translations);
				self.send(html);	
			});
      
    });
  };
  next();
  
}

function insertHtml(html, items){
	//Insert translations inside HTML markup.
	$ = cheerio.load(html);
	var translations = $("[data-translation]");
	translations.each(function(index, element){
		var $element = $(element);
		var key = $element.attr("cat") + "/" + $element.attr("index");
		var text = items[key];
		console.log(key, text);
		if (text) {
			$element.html(text);	
		}	
	});
	return $.root().html();
}

function getTranslations(items, cb){
	console.log("Get translations...", items);
	var url = "http://wimsapp-21087.onmodulus.net/api/translations";
	url += '?language=' + 4;
	url += '&items=' + JSON.stringify(items)
	console.log("Get all translations...", url);
	request.get(url, function (error, response, body) {
		if (error) throw error;
		cb(body);
	});	
}
