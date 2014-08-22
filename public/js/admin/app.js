/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.tinymce', [])
  .value('uiTinymceConfig', {})
  .directive('uiTinymce', ['uiTinymceConfig', function (uiTinymceConfig) {
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    return {
      priority: 10,
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var expression, options, tinyInstance,
          updateView = function () {
            ngModel.$setViewValue(elm.val());
            if (!scope.$root.$$phase) {
              scope.$apply();
            }
          };
        // generate an ID if not present
        if (!attrs.id) {
          attrs.$set('id', 'uiTinymce' + generatedIds++);
        }

        if (attrs.uiTinymce) {
          expression = scope.$eval(attrs.uiTinymce);
        } else {
          expression = {};
        }
        options = {
          // Update model when calling setContent (such as from the source editor popup)
          setup: function (ed) {
            var args;
            ed.on('init', function(args) {
              ngModel.$render();
            });
            // Update model on button click
            ed.on('ExecCommand', function (e) {
              ed.save();
              updateView();
            });
            // Update model on keypress
            ed.on('KeyUp', function (e) {
              ed.save();
              updateView();
            });
            // Update model on change, i.e. copy/pasted text, plugins altering content
            ed.on('SetContent', function (e) {
              if(!e.initial){
                ed.save();
                updateView();
              }
            });
            if (expression && expression.setup) {
              scope.$eval(expression.setup);
              delete expression.setup;
            }
          },
          mode: 'exact',
          elements: attrs.id
        };
        // extend options with initial uiTinymceConfig and options from directive attribute value
        angular.extend(options, uiTinymceConfig, expression);
				console.log("timymceOption", uiTinymceConfig);
        setTimeout(function () {
          tinymce.init(options);
        });


        ngModel.$render = function() {
          if (!tinyInstance) {
            tinyInstance = tinymce.get(attrs.id);
          }
          if (tinyInstance) {
            tinyInstance.setContent(ngModel.$viewValue || '');
          }
        };
      }
    };
  }]);


var app = angular.module("app", ['ngRoute', 'ui.router', 'ct.ui.router.extras', 'ui.tinymce', 'ngSanitize']);

if (false) app.config(['$routeProvider', '$locationProvider', function($routeProvider,$locationProvider) {
	$routeProvider.
	when('/admin/items/:cat/:n', {templateUrl: '/html/etext-item.html'}).
	otherwise({redirectTo: '/admin/items/'});
	
	$locationProvider.html5Mode(true);
}]);


app.run(
	['$rootScope', '$state', '$stateParams',
	function ($rootScope,   $state,   $stateParams) {

		// It's very handy to add references to $state and $stateParams to the $rootScope
		// so that you can access them from any scope within your applications.For example,
		// <li ui-sref-active="active }"> will set the <li> // to active whenever
		// 'contacts.list' or one of its decendents is active.
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
}]);

app.config(function($stateProvider, $urlRouterProvider) {
  
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/items");
  
  // Now set up the states
  $stateProvider
    .state('items', {
      url: "/items",
      //templateUrl: "html/etext/items.html",
			views:{
				items: {
					templateUrl: "html/etext/items.html"
				}
			},
			deepStateRedirect: true,
			sticky: true
    })
		.state('items.list', {
      url: "/:categoryId",
      templateUrl: "html/etext/etext-list.html"
    })
		.state('items.list.detail', {
      url: "/:index",
      templateUrl: "html/etext/etext-item.html"
    })
	
    .state('keywords', {
      url: "/keywords",
      templateUrl: "html/keywords.html",
			deepStateRedirect: true
    })
	
		.state('blog', {
      url: "/blog",
      //templateUrl: "html/blog/blog.html",
			views:{
				blog: {
					templateUrl: "html/blog/blog.html"
				}
			},			
			deepStateRedirect: true,
			sticky: true
    })
		.state('blog.list', {
      url: "/:language",
      templateUrl: "html/blog/blog-list.html",
			controller: 'BlogListController'
			
    })
		.state('blog.list.post', {
      url: "/:id",
      templateUrl: "html/blog/post.html"
    })
	
		.state('faq', {
      url: "/faq",
      //templateUrl: "html/faq/faq.html",
			views:{
				faq: {
					templateUrl: "html/faq/faq.html"
				}
			},				
			deepStateRedirect: true,
			sticky: true
    })
		.state('faq.list', {
      url: "/:language",
      templateUrl: "html/faq/faq-list.html",
			sticky: true
    })
		.state('faq.list.entry', {
      url: "/:id",
      templateUrl: "html/faq/faq-entry.html"
    })	
});