/*

Application services

*/
app.factory('AllLanguages', ['$http', function ($http) {
	//private attributes
	var languages = [];//used to "cache" available languages
	
	function loadList(cb){
		//Fetch available languages by ajax
		$http.get('/api/languages').success(function (data) {	
			languages = data;
			if(cb) cb(data);
		});	
	}
	
	function getLanguage(value){
		//Return a language object {value:'eng',label:'English'} from a language code.
		var found = {};
		angular.forEach(languages, function (element) {
			if (element.value == value) found = element;
		});
		return found
	}	
	
	//exposed API
	return {
		get: function(cb){
			if(languages.length == 0){
				loadList(cb);
			}
			else{
				cb(languages);
			}
		},
		getLanguage: function(value){
			return getLanguage(value)
		}
	};
}]);

/*

Language picker component used to select the language in BLOG and FAQ pages.

*/

app.directive("languagePicker", ['AllLanguages', '$state', '$stateParams', function(AllLanguages, $state, $stateParams) {
	return {
		restrict: "E",
		templateUrl: "/html/directives/language-picker.html",
		scope:{
			state: '@',
			currentLanguage: '=language'
		},
		controller: function($scope) {
			AllLanguages.get(function (data) {
				$scope.languages = data;
				angular.forEach(data, function (element) {
					if (element.value == $stateParams.language) $scope.currentLanguage = element;
				});
			});

			$scope.setLanguage = function (language) {
				$scope.currentLanguage = language;
				//$state.go($scope.state, {language: language.value});
			};			

		},
		controllerAs: "languagePicker"
	};
}]);

/*

Application controllers

*/

app.controller("MainController", function ($scope, AllLanguages, $state, $stateParams) {
	console.info("MainController start!");
	AllLanguages.get();
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		//console.log("$stateChangeStart event",toState, toParams);
		console.log("Switch language", toParams.language);
		var lang = toParams.language;
		if (lang){
			$scope.currentLanguage = AllLanguages.getLanguage(lang)
		}
	});	
});
		

app.controller("EtextController", function ($scope, $http, $location, $state, Languages) {
	console.info("EtextController start!");
	$scope.categories = [];//all categories (or formerly the "Page Groups")
	$scope.categoryItems = [];//all items for the selected category
	$scope.currentCategory = {};
	$scope.currentItem = {};
	$scope.translations = [];
	$scope.content = {
		title : "My title",
		body: "Body!"
	};
	
	$scope.allLanguages = Languages.get();
		
	$http.get('/api/item-categories').success(function (data) {
		$scope.categories = data;
	});
	
	$scope.viewCategory = function (category) {
		console.info("Go to category", category);
		$scope.currentCategory = category;
		//$scope.loadTranslationList(category.id, 4);
		$state.go('items.list', { categoryId: category.id});
	};
	

	
	$scope.viewTranslation = function (item) {
		//item.category = $scope.getCategory(item);
		//item.availableLanguages = getAvailableLanguages(item);
		$scope.currentItem = item;
		console.info("currentItem", item);
		//$scope.loadItemTranslation(item);
		//before $location.path('/admin/items/' + item.cat + '/' + item.index);
		$state.go('items.list.detail', { categoryId: item.cat, index: item.index });
	};
	
	$scope.loadItemTranslation = function (item) {
		$http.get('/api/translations/' + item.cat + '/' + item.n).success(function (data) {
			$scope.translations = data;
		});			
	};
	
	$scope.formatId = function (item) {
		return "0001-" + addZeros(item.cat, 4) + "-" + addZeros(item.index,4);
	};
	
	addZeros = function(x,nbDigit){
		//a private function to add "0" before numbers
		var str = new String(x);
		str = "00000" + str;
    return str.substr(str.length - nbDigit,nbDigit);	
	};
	
	$scope.truncateText = function (item) {
		return truncate(item.text, 100);
	};
	
	function truncate(source, limit){
		return (source.length <= limit) ? source : source.substr(0, limit ) + " [...]";
	};
	
	function getAvailableLanguages(item) {
		var array = [];
		var ids = item.category.languages;
		$.each(ids, function (index,element) {
			var language = getLanguage(element);
			array.push(language);
		});			
		return array;
	}
	$scope.getCategory = function(item){
		//Return a "Category" object from a given item
		var category = {};
		$.each($scope.categories, function (index,element) {
			if(item.cat == element.id) category = element;
		});		
		return category;
	}

	
});//MainController

app.controller('ItemCategoryListController', function ($scope, $http, $stateParams) {
	var language = 4;
	var cat = $stateParams.categoryId;
	$scope.loading = true;
	
	$scope.loadTranslationList = function(category_id, language){
		$http.get('/api/item-categories/' + category_id + '/?language=' + language).success(function (data) {
			$scope.categoryItems = data;
			$scope.loading = false;
		});		
	};	
	
	$scope.loadTranslationList(cat, language);
});

/*
 
Etext Item 
 
 */

app.controller("EtextItemController", function ($http, $routeParams, $stateParams, $scope, Languages) {
	//before this.categoryId = $routeParams.cat;
	//before this.index = $routeParams.n;
	this.categoryId = $stateParams.categoryId;
	this.index = $stateParams.index;	
	
	_this=this;
	
	this.loadTranslations = function () {
		console.info("Load the translations...");
		$http.get('/api/items/' + _this.categoryId + '/' + _this.index).success(function (data) {
			_this.comment = data.comment;
			_this.categoryTitle = data.categoryTitle;
			_this.translations = data.translations;
		});			
	};	
	
	this.getLanguage = function(languageId){
		//Return a "Category" object form a given item
		var language = {};
		$.each(Languages.get(), function (index,element) {
			if(languageId == element.acr) language = element;
		});		
		return language.text;
	};
	
	this.loadTranslations();
});

/*
 
Translation block (one by language)

 */
app.controller("TranslationBlockController", function ($http) {
	console.log("TranslationBlockController");
	this.editMode = false;
	var _this = this;
	this.edit = function (translation) {
		this.editMode = true;
		console.log(translation);
	};
	this.cancel = function (translation) {
		this.editMode = false;
	};
	this.save = function (translation, item){
		console.log(translation, item);
		var data = {
			text: (translation == "comment") ? item.comment : translation.text,
			lang: (translation == "comment") ? "comment" : translation.lang
		};
		
		$http.put('/api/translations/' + item.categoryId + '/' +item.index, data).success(function (result) {
			console.info(result);
			_this.editMode = false;
		});				
	};
});

app.controller("KeywordsController", function($http, $state){
	console.info("KeywordsController start!");
});

/*

BLOG

*/

app.controller("BlogController", function($http, $scope, $state, $stateParams, AllLanguages){
	_this = this;
	console.info("BlogController start!");
});

app.controller("BlogListController", function ($scope, $stateParams, $state, $http) {
	console.info("BlogListController start!");
	$scope.posts = [];
	
	$scope.getPosts = function () {
		$scope.loading = true;
		$http.get('/api/blog/list/' + $scope.language).success(function (data) {
			$scope.posts = data.posts;
			$scope.loading = false;			
		});		
	};	
	$scope.viewPost = function(post){
		$state.go('blog.list.post', {id: post._id})
	};
	
	$scope.$on("update", function () {
		console.info("update event!");
		$scope.getPosts();
	});
	
	$scope.language = $stateParams.language;
	$scope.getPosts();
})

app.controller("PostController", function ($http, $stateParams, $scope){
	console.info("PostController start!");
	this.data = null;
	var _this = this;
	$scope.loading = true;
	$scope.editMode = false;
	$scope.messages = {};
	var id = $stateParams.id;
	
	$http.get('/api/blog/' + id).success(function (data) {
		_this.data = data.post;
		$scope.loading = false;
	});	
	
	
	$scope.tinymceOptions = {
		menubar: false
	};	
	
	$scope.edit = function () {
		console.log($scope.editMode);
		$scope.editMode = true;
	};
	
	$scope.save = function () {
		$http.post('/api/blog/update/' + id, _this.data).success(function (data) {
			$scope.editMode = true;
			$scope.messages.saved = true;
			$scope.$emit('update');//to update the parent scope (BlogList)
			$scope.editMode = false;
		});			
	};
	
});

/*

FAQ

*/

app.controller("FAQController", function($scope, $state, $stateParams, AllLanguages){
	console.info("FAQ start!");

});

app.controller("FAQListController", function ($scope, $stateParams, $state, $http) {
	console.info("FAQListController start!");
	$scope.faq = [];
	
	$scope.getFAQ = function () {
		$scope.loading = true;
		$http.get('/api/faq/list/' + $scope.language).success(function (data) {
			$scope.faqs = data.faqs;
			$scope.loading = false;
		});		
	};	
	$scope.viewFAQ = function(faq){
		$state.go('faq.list.entry', {id: faq._id})
	};	
	
	$scope.language = $stateParams.language;
	$scope.getFAQ();
})

app.controller("FAQEntryController", function ($http, $stateParams, $scope){
	console.info("FAQEntrt controller start!");
	this.data = null;
	var _this = this;
	$scope.loading = true;
	$scope.editMode = false;
	$scope.messages = {};
	var id = $stateParams.id;
	
	$http.get('/api/faq/' + id).success(function (data) {
		_this.data = data.faq;
		$scope.loading = false;
	});	
	
	
	$scope.tinymceOptions = {
		menubar: false
	};	
	
	$scope.edit = function () {
		console.log($scope.editMode);
		$scope.editMode = true;
	};
	
	$scope.save = function () {
		$http.post('/api/faq/update/' + id, _this.data).success(function (data) {
			$scope.editMode = true;
			$scope.messages.saved = true;
			
	});			
	};
	
});


