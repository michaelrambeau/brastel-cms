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
		console.log('--- before regeneration ---');//mike
		return previous.apply(this, arguments);
	};	
	var locals = res.locals;
	
	locals.navLinks = [
		{ label: 'Home',		key: 'home'},
		{ label: 'FAQ',		key: 'faq'},	
		{ label: 'About',		key: 'about'}		
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
	//var url = urlModule.parse(req.originalUrl).path;
	//console.log('requiredUser in routes/middleware.js', url);
	//req.session.urlFrom = url;
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		res.locals.user = req.user;
		next();
	}
	
};
exports.requireGoogleUser = function(req, res, next) {
	var url = urlModule.parse(req.originalUrl).path;
	console.log('requireGoogleUser in routes/middleware.js, url saved in the session:', url);
	req.session.urlFrom = url;
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/social/google/login');//mike
	} else {
		res.locals.user = req.user;
		next();
	}
	
};

exports.parseBrastelUrl = function (req, res, next) {
	var path = urlModule.parse(req.originalUrl).path;
	var allLanguageCodes = _.map(keystone.get('languages'), function (lang) {
		return lang.value;
	});
	var re = new RegExp('^\/(' + allLanguageCodes.join('|') + ')\/(.*)', 'i');
	if (re.test(path)){
		var array=re.exec(path);//return an array ["/jpn/faq/", "jpn", "faq"]
		var languageCode = array[1];
		req.session.language = languageCode;
		var language = keystone.getLanguage(languageCode);
		var page = (array.length >1) ? array[2] : '';
		res.locals.context = {
			page: page,
			language: language
		};		
	}

	next();
};

exports.multilingual = function (req, res, next) {
		//initialize an empty array of etext items
		req.items = [];
		
		//make a translation function available in the template
		res.locals.translate = function (item) {
			req.items.push(item);
		};
	
		//Helper to build a multilingual URL in the templates
		//languageCode paramter is optional (the current language by default)
		res.locals.getURL = function(page, languageCode) {
			var lang = languageCode || req.session.language;
			var url = '/' + lang + '/' + page;
			return url;
		};
		next();
};


exports.postProcessView = function(req, res, next) {
	//from this Gist https://gist.github.com/mrlannigan/5051687
	
	//console.log('postProcessView middleware...');
  var render = res.render;
  res.render = function(view, opt, fn) {
    var self = this,
      options = opt || {},
      req = this.req,
      app = req.app,
      defaultFn;
 
    if ('function' == typeof options) {
      fn = options;
			options = {};
    }
 
    defaultFn = function(err, str){
      if (err) return req.next(err);
      self.send(str);
    };
		
    if ('function' != typeof fn) {
      fn = defaultFn;
    }
 		
    render.call(self, view, options, function(err, str) {
			if (err) {
				var html = '<h2>Template error</h2><pre>' + err.toString() + '</pre>';
				res.status(500).send(html);
				//TO BE DONE: find a way to sue the default error handler (in core/mount.js)default500Handler(err, req, res, next);
				return;
			}
			var items = req.items;		
			//console.log('Overwriting render...', items);
      if (items === undefined || items.length === 0) {
				//No item to translate in the page.
				console.log('Nothing to translate in this page!');
				self.send(str);
			}
			else {
				var language = res.locals.context.language;
				
				getTranslationsDirectCall(items, language.value, req, res, function(result){
					var html = insertHtml(str, result);
					self.send(html);	
				});				
			}
    });
  };
  next();
  
};

function insertHtml(html, items){
	//Insert translations inside HTML markup.
	var $ = cheerio.load(html);
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

function getTranslationsDirectCall(items, language, req, res, cb) {
	require('./api/getTranslations').getListItemTranslation(items, language, cb);
}

function getTranslationsFromAPI(items, language, req, res, cb){
	//var language = getCurrentLanguage(req);
	console.log("Get translations...", items, 'for language ',language);
	var url = "http://localhost:3000/api/items";
	if (!language) throw new Error ('Unable to get the current language!');
	url += '?language=' + language.number;
	url += '&items=' + JSON.stringify(items);
	console.log("Get all translations...", url);
	request.get(url, function (error, response, body) {
		if (error) throw error;
		cb(body);
	});	
}

function getCurrentLanguage (req) {
	var code = (req.session.language) ? req.session.language : "eng";
	return keystone.getLanguage(code);
}
