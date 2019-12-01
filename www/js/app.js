// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
			cordova.plugins.Keyboard.disableScroll(false);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

.config(function ($stateProvider, $urlRouterProvider) {

		// Ionic uses AngularUI Router which uses the concept of states
		// Learn more here: https://github.com/angular-ui/ui-router
		// Set up the various states which the app can be in.
		// Each state's controller can be found in controllers.js
		$stateProvider

		// setup an abstract state for the tabs directive
			.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: 'templates/tabs.html'
		})

		// Each tab has its own nav history stack:

		.state('tab.dash', {
			url: '/dash',
			views: {
				'tab-dash': {
					templateUrl: 'templates/tab-dash.html',
					controller: 'DashCtrl'
				}
			}
		})

		.state('tab.stores', {
			url: '/stores',
			views: {
				'tab-stores': {
					templateUrl: 'templates/tab-stores.html',
					controller: 'StoresCtrl'
				}
			}
		})

		.state('tab.scan-shop-list', {
			url: '/scan-shop-list',
			views: {
				'tab-scan-shop-list': {
					templateUrl: 'templates/tab-scan-shop-list.html',
					controller: 'ScanShopListCtrl'
				}
			}
		})

		.state('tab.offers-bids', {
			url: '/offers-bids',
			views: {
				'tab-offers-bids': {
					templateUrl: 'templates/tab-offers-bids.html',
					controller: 'OffersBidsCtrl'
				}
			}
		})


		.state('tab.profile', {
			url: '/profile',
			views: {
				'tab-profile': {
					templateUrl: 'templates/tab-profile.html',
					controller: 'ProfileCtrl'
				}
			}
		})

		.state('profile2', {
			url: '/profile2',
			templateUrl: 'templates/tab-profile.html',
			controller: 'ProfileCtrl',
			params: {
				comeFromLoginPage: false
			}
		})

		.state('tab.new-scan', {
			url: '/new-scan',
			views: {
				'tab-new-scan': {
					templateUrl: 'templates/tab-new-scan.html',
					controller: 'NewScanCtrl'
				}
			}
		})


		.state('tab.product-sku-detail', {
			url: '/product-sku-detail/:productSku',
            views: {
				'tab-scan-shop-list': {
					templateUrl: 'templates/product-detail.html',
					controller: 'ProductSkuDetailCtrl'
				}
			},
			params: {
				showDescription: true,
				showMakeDeal: false,
				showForm: false
			}
		})

        .state('tab.request-detail', {
			url: '/request-detail/:req_id',
			views: {
				'tab-scan-shop-list': {
					templateUrl: 'templates/request-detail.html',
					controller: 'RequestDetailCtrl'
				}
			},
            params: {
				request: null
			}
		})

        .state('tab.request-code', {
			url: '/request-code',
			views: {
				'tab-scan-shop-list': {
					templateUrl: 'templates/request-code.html',
					controller: 'RequestCodeCtrl'
				}
			},
            params: {
				codetype: null,
                code: null
			}
		})

		.state('tab.store-detail', {
			url: '/store-detail/:storeId',
			views: {
				'tab-stores': {
					templateUrl: 'templates/store-detail.html',
					controller: 'StoreDetailCtrl'
				}
			},
			params: {

			}
		});

		$stateProvider
			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
			});

		$stateProvider
			.state('splash', {
				url: '/splash',
				templateUrl: 'templates/splash.html',
				controller: 'SplashCtrl'
			});


		// if none of the above states are matched, use this as the fallback
		//$urlRouterProvider.otherwise('/tab/dash');
		$urlRouterProvider.otherwise('/splash');

	})
	.config(function ($ionicConfigProvider) {
		$ionicConfigProvider.tabs.position('bottom');
		$ionicConfigProvider.navBar.alignTitle('center');
	});
