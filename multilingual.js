'use strict()';

var _ = require("underscore");

var languages = ["por", "esp", "eng", "jpn"];
var defaultLanguage = "eng";

var tools = {
	
	defaultLanguage: defaultLanguage,
	
	addMultilingualPath: function (fields) {
	//Loop through the fields and create "field path" for all languages (body.eng, body.jpn...)
		var fields2 = {};
		for (var prop in fields) {
			if(fields[prop].multilingual == true) {
				fields2[prop] = {}
				languages.forEach(function(lang){
					fields2[prop][lang] = _.clone(fields[prop], null);//"shallow" copy 
					if (lang != defaultLanguage) {
						fields2[prop][lang].required = false;
						fields2[prop][lang].initial = false;
					}	
				});

			}
			else{
				fields2[prop] = fields[prop];
			}
		}
		return fields2;
	}		
}	

module.exports = tools;