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
		var found = null;
		angular.forEach(languages, function (element) {
			if (element.value == value) found = element;
		});
		return found;
	}	
	
	//exposed API
	return {
		get: function(cb){
			if(languages.length === 0){
				loadList(cb);
			}
			else{
				cb(languages);
			}
		},
		getLanguage: function(value){
			return getLanguage(value);
		}
	};
}]);

app.service('CurrentUser', ['$http', function ($http) {
	return function() {
		return {
			name: 'mike',
			languages: ['eng']
		};
	};
}]);

/*

Language picker component used to select the language in BLOG and FAQ pages.

*/

app.directive("languagePicker", ['AllLanguages', '$state', '$stateParams', function(AllLanguages, $state, $stateParams) {
	return {
		restrict: "E",
		templateUrl: "/html/directives/language-picker.html",
		scope: {
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

app.controller("MainController", function ($scope, AllLanguages, $state, $stateParams, CurrentUser) {
	console.info("MainController start!");
	$scope.currentUser = CurrentUser();
	AllLanguages.get();
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		//console.log("$stateChangeStart event",toState, toParams);
		console.log("Switch language", toParams.language);
		var lang = toParams.language;
		if (lang){
			$scope.currentLanguage = AllLanguages.getLanguage(lang);
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
	
	$scope.allLanguages = Languages.get();
	$scope.selectedLanguages = ['eng', 'jpn'];
		
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
	
	var addZeros = function(x,nbDigit){
		//a private function to add "0" before numbers
		var str = '' + x;
		str = "00000" + str;
    return str.substr(str.length - nbDigit,nbDigit);	
	};
	
	$scope.truncateText = function (item) {
		return truncate(item.text, 100);
	};
	
	function truncate(source, limit){
		return (source.length <= limit) ? source : source.substr(0, limit ) + " [...]";
	}
	
	$scope.getCategory = function(item){
		//Return a "Category" object from a given item
		var category = {};
		$.each($scope.categories, function (index,element) {
			if(item.cat == element.id) category = element;
		});		
		return category;
	};

	
});//MainController

app.controller('ItemCategoryListController', function ($scope, $http, $stateParams) {
	var language = 'eng';
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

app.controller("EtextItemController", function ($http, $routeParams, $stateParams, $scope, AllLanguages) {
	//before this.categoryId = $routeParams.cat;
	//before this.index = $routeParams.n;
	this.categoryId = $stateParams.categoryId;
	this.index = $stateParams.index;	
	
	var _this = this;
	
	this.loadTranslations = function () {
		console.info("Load the translations...");
		$http.get('/api/items/' + _this.categoryId + '/' + _this.index).success(function (data) {
			_this.comment = data.comment;
			_this.categoryTitle = data.categoryTitle;
			_this.translations = data.text;
			_this.languages = data.languages;
		});			
	};	
	
	this.getLanguage = function(languageId){
		//Return a "Language object" {number, value, label} from a given language code ('eng' for example
		var language = AllLanguages.getLanguage(languageId);		
		return (language) ? language.label : languageId;
	};
	
	this.switchLanguage = function (language) {
		var index = $scope.selectedLanguages.indexOf(language);
		if (index === -1){
			$scope.selectedLanguages.push(language);
		}	else {
			$scope.selectedLanguages.splice(index,1);
		}
	};

	this.loadTranslations();
});

/*
 
Translation block (one by language)

 */
app.controller("TranslationBlockController", function ($scope, $http) {
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

	this.save = function (language, item){
		console.log('save', language, item);
		var text = item.translations[language];
		var data = {
			text: (language == "comment") ? item.comment : text,
			language: (language == "comment") ? "comment" : language
		};
		
		$http.put('/api/items/' + item.categoryId + '/' +item.index, data).success(function (result) {
			console.info(result);
			_this.editMode = false;
		});				
	};

	this.canEdit = function (language) {
		return $scope.currentUser.languages.indexOf(language) > -1;
	};

});

app.controller("KeywordsController", function($http, $state){
	console.info("KeywordsController start!");
});

/*

BLOG

*/

app.controller("BlogController", function($http, $scope, $state, $stateParams, AllLanguages){
	var _this = this;
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
		$state.go('blog.list.post', {id: post._id});
	};
	
	$scope.$on("update", function () {
		console.info("update event!");
		$scope.getPosts();
	});
	
	$scope.language = $stateParams.language;
	$scope.getPosts();
});

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
		$state.go('faq.list.entry', {id: faq._id});
	};	
	
	$scope.language = $stateParams.language;
	$scope.getFAQ();
});

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


