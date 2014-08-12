app.controller("MainController", function ($scope, $http, $location, $state, Languages) {
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
		console.info("currentCategory", category);
		$scope.currentCategory = category;
		$scope.loadTranslationList(category.id, 4);
	};
	
	$scope.loadTranslationList = function(category_id, language){
		$http.get('/api/item-categories/' + category_id + '/?language=' + language).success(function (data) {
			$scope.categoryItems = data;
		});		
	};
	
	$scope.viewTranslation = function (item) {
		//item.category = $scope.getCategory(item);
		//item.availableLanguages = getAvailableLanguages(item);
		$scope.currentItem = item;
		console.info("currentItem", item);
		//$scope.loadItemTranslation(item);
		//before $location.path('/admin/items/' + item.cat + '/' + item.index);
		$state.go('items.list', { categoryId: item.cat, index: item.index });
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
			_this.initItemList();
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
	
	this.initItemList = function(){
		if(!$scope.$parent.currentCategory.id){
			console.log("Load the item list");
			$scope.loadTranslationList(_this.categoryId, 4);
			return false;
			var category = $scope.$parent.getCategory({
				cat: _this.categoryId
			});
			$scope.$parent.viewCategory(category);
		}		
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

app.controller("BlogController", function($http, $scope, $state){
	console.info("BlogController start!");
	$scope.languages = [];
	$scope.posts = [];
	
	$scope.getLanguages = function () {
		$http.get('/api/languages').success(function (data) {
			$scope.languages = data;
		});		
	};
	$scope.getPosts = function () {
		$http.get('/api/blog/list/' + $scope.language).success(function (data) {
			$scope.posts = data.posts;
		});		
	};
	$scope.viewPost = function(post){
		$state.go('blog.post', {id: post._id})
	};
	$scope.getLanguages();

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
			
	});			
	};
	
});

/*

FAQ

*/

app.controller("FAQController", function($http){
	console.info("FAQ start!");
});


