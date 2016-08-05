/*================================================================
App momentumMachines
==================================================================*/
'use strict';

var app = angular.module('momentumMachines', ['ngRoute', 'ngTouch', 'ngAnimate','ngLodash']);

app.config(['$routeProvider','$httpProvider', function($routeProvider,$httpProvider) {
    
    $routeProvider
    	// .when('/', {
     //        requireLayout:true,
     //        templateUrl: 'partials/layout.html'
    	// })
    	.when('/burgerPage', {
            requireLayout:true,
    		templateUrl: 'partials/burger/burgerPage.html'
    	})
    	.when('/sidesPage', {
            requireLayout:true,
    		templateUrl: 'partials/sides/sidesPage.html'
    	})
    	.when('/drinksPage', {
            requireLayout:true,
    		templateUrl: 'partials/drinks/drinksPage.html'
    	})
        .when('/myOrder',{ 
            requireLayout:false,
            templateUrl: 'partials/cart/myOrder.html'
        })
        .when('/orderTracking',{
            requireLayout:false,
            templateUrl: 'partials/cart/orderTracking.html'
        })

        // Customization realted pages start
        .when('/pattyPage',{
            requireLayout:true,
            isCustomizePage:true,
            templateUrl: 'partials/burger/customize/pattyPage.html'
        })
        .when('/toppingsPage',{
            requireLayout:true,
            isCustomizePage:true,
            templateUrl: 'partials/burger/customize/toppingsPage.html'
        })
        .when('/saucesPage',{
            requireLayout:true,
            isCustomizePage:true,
            templateUrl: 'partials/burger/customize/saucesPage.html'
        })
        .when('/seasoningsPage',{
            requireLayout:true,
            isCustomizePage:true,
            templateUrl: 'partials/burger/customize/seasoningsPage.html'
        })
        // Customization realted pages end

        .otherwise({redirectTo:'/burgerPage'});

    // This is required for Browser Sync to work poperly
	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

}]);

// Run block 

app.run(['$rootScope', function ($rootScope) {

    // to do when a when changes successfully
    // use 'currentState' on any view or '$rootScope.currentState' on controllers to get the current state name

    
    $rootScope.$on('$routeChangeSuccess', function (event, toState, fromState) {
        if (toState.loadedTemplateUrl) {
            var pName = toState.loadedTemplateUrl.split('/'),page = pName[pName.length-1],pageName = page.split('.html')[0];
            // if (fromState){
            //     var preName = fromState.loadedTemplateUrl.split('/'),prePage = preName[preName.length-1],prePageName = prePage.split('.html')[0];
            // }
            if ($rootScope.currentState) {
                $rootScope.previousState = angular.copy($rootScope.currentState);
            }
            $rootScope.currentState = pageName;
            $rootScope.stateConfig = toState;
        }
    });
}]);

// Constants Start

app.constant('HEADERLINKORDER', {
    'burgerPage' : 1,
    'sidesPage' : 2,
    'drinksPage' : 3
});

// Constants End

// ====================== START OF burgerCtrl=====================
'use strict';

app.controller('burgerCtrl',['$scope', '$rootScope', 'burgerService', function ($scope, $rootScope, burgerService) {

	
	//fetching burgers  list 	
	burgerService.getBurgerData().then(function (data) {
		$scope.burgerDetails = data;
		
	},function (error) {
		
	});

	//fetching recent burgers  list 	
		burgerService.getRecentBurgerData().then(function (data) {
		$scope.recentBurgerDetails = data;
		
	},function (error) {
		
	});
	
	//show more 20 rececnt ordedrs 
	$scope.showMore = function(){
		$rootScope.recentlyOrderedQtyLimit = 23;
	}
}]);

// ====================== END OF burgerCtrl =====================
// ====================== START OF drinksCtrl=====================
'use strict';

app.controller('drinksCtrl',['$scope', '$rootScope', 'drinksService', function ($scope, $rootScope, drinksService) {
	
	drinksService.getDrinksData().then(function (data) {
		$scope.drinksDetails = data;
	},function (error) {

	});
	
}]);

// ====================== END OF drinksCtrl =====================
// ====================== START OF mainController=====================
'use strict';

app.controller('mainController', ['$scope', '$rootScope', '$location', 'HEADERLINKORDER', '$timeout', 'lodash', 'calculationService', function($scope, $rootScope, $location, HEADERLINKORDER, $timeout, lodash, calculationService) {

    //initialising empty order cart     
    $scope.orderCart = {
        "burgers": [],
        "sides": [],
        "drinks": []
    };
    $scope.itemCount = {
        "burgers": 0,
        "sides": 0,
        "drinks": 0,
        "total": 0
    }

    $scope.total = 0;
    $scope.grandTotal = 0;

    //Service Tax TODO to be taken from API
    $scope.serviceTaxPercent = 7;

    //Recently orderd show limit :
    //settig a variable to show only 3 recently ordered burgers 
    $rootScope.recentlyOrderedQtyLimit = 3;

    // SWIPE FUNCTION FOR THE MAIN PAGE START

    var slideLeft = {
        'burgerPage': 'sidesPage',
        'sidesPage': 'drinksPage',
        'drinksPage': null,
        'pattyPage' : 'toppingsPage',
        'toppingsPage' : 'saucesPage',
        'saucesPage' : 'seasoningsPage',
        'seasoningsPage' : null
    };

    var slideRight = {
        'burgerPage': null,
        'sidesPage': 'burgerPage',
        'drinksPage': 'sidesPage',
        'pattyPage' : null,
        'toppingsPage' : 'pattyPage',
        'saucesPage' : 'toppingsPage',
        'seasoningsPage' : 'saucesPage'
    };


    $scope.leftSwipped = function(event, dir) {
        var state = $rootScope.currentState;
        if (slideLeft[state] !== null) {
            $scope.switchView(slideLeft[state]);
        }
    }
    $scope.rightSwipped = function(event, dir) {
        var state = $rootScope.currentState;
        if (slideRight[state] !== null) {
            $scope.switchView(slideRight[state]);
        }
    }

    // SWIPE FUNCTION FOR THE MAIN PAGE END

    $scope.navigateLink = function(view) {
        var currentView = view;
        var prevView = $rootScope.previousState;
        $scope.switchView(view);
    }


    // A global function to switch between views 
    $scope.switchView = function(view) {
        $location.path(view); // path not hash
    }


    // cheking if the item already in the cart and increasing quantity
    $scope.checkExistingItem = function(type, item, itemType) {
        $scope.exists = false;
        angular.forEach(type, function(selectedItem, index) {
            if (selectedItem.id == item.id) {
                $scope.orderCart[itemType][index].quantity = $scope.orderCart[itemType][index].quantity + item.quantity;
                $scope.exists = true;
            }
        });
        return $scope.exists;
    }

    //A gobal function to add orders
    //addedItemType = burger/sides/fries 
    // addedItem = object for selected burger/sides/fries 
    $scope.addToOrder = function(addedItemType, addedItem) {
            var itemType = addedItemType;
            var item = angular.copy(addedItem);

            if ($scope.checkExistingItem($scope.orderCart[itemType], item, itemType)) {

            } else {
                $scope.orderCart[itemType].push(item);

            }

            // $scope.total = $scope.total + (item.rate * item.quantity);
            // $scope.serviceTax = ($scope.total * $scope.serviceTaxPercent) / 100;
            // $scope.grandTotal = $scope.total + $scope.serviceTax;
            // console.log($scope.total);


            //showing added to order notification 
            $scope.addedToOrder = true;
            $timeout(function() {
                //hiding added to order notification 
                $scope.addedToOrder = false;
            }, 500);

            $scope.reCalculateitems();



        }
        //Calculating cost and numbet of total items 
    $scope.reCalculateitems = function() {
        calculationService.getItemCounts($scope);
        calculationService.getTotalCartValue($scope);
    }


}]);

// ====================== END OF mainController =====================

// ====================== START OF orderCtrl=====================
'use strict';

app.controller('orderCtrl', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {

    $scope.myOrderCart = $scope.orderCart;

    $scope.$watch('myOrderCart', function() {
        //watch if any quantity changes and recalculate the cost 
        $scope.reCalculateitems();
    }, true);


    // Stripe payment related start

    var handler = StripeCheckout.configure({
        key: 'pk_test_K1DFaV3sWjnMOFb4lHJhEtku',
        image: '/images/img_bc_t_tomato.png',
        locale: 'auto',
        token: function(token) {
          // Use the token to create the charge with a server-side script.
          // You can access the token ID with `token.id`
          console.log(token);
          $scope.$apply(function(){
          	$location.path('/orderTracking');
          });
        }
    });

    $scope.payStripe = function (e,total) {
        // Open Checkout with further options
        var grandTotal = (total.toFixed(2))*100
        handler.open({
          name: 'Momentum Machines',
          description: 'payment',
          amount: grandTotal
        });
        e.preventDefault();
    }
    
    $(window).on('popstate', function() {
        handler.close();
    });

    // Stripe payment related end



}]);

// ====================== END OF orderCtrl =====================

// ====================== START OF orderTrackingCtrl=====================
'use strict';

app.controller('orderTrackingCtrl',['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
	
	$scope.timer = true;
	$scope.ready = false;
	$scope.oops = false;
	
}]);

// ====================== END OF orderTrackingCtrl =====================
// ====================== START OF sidesCtrl=====================
'use strict';

app.controller('sidesCtrl', ['$scope', '$rootScope', 'sidesService', function($scope, $rootScope, sidesService) {


   

        //Fetching sides list from api
    sidesService.getSidesData().then(function(data) {
        $scope.sidesDetails = data;
    }, function(error) {

    });


}]);

// ====================== END OF sidesCtrl =====================

/*================================================================
Directive = Timer
==================================================================*/
/*global app,$*/
app.directive('countDown', ['$rootScope','$timeout', function($rootScope,$timeout) {
    'use strict';

    return {
        restrict: 'A',
        replace: false,
        link: function(scope, element, attrs) {

            function countdown(minutes) {
                var seconds = 60;
                var mins = minutes

                function tick() {
                    var counter = document.getElementById("timer");
                    var current_minutes = mins - 1;
                    seconds--;
                    counter.innerHTML =
                        current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
                    if (seconds > 0) {
                        $timeout(tick, 1000);
                    } else {

                        if (mins > 1) {
                            // scope.timer = true;
                            // scope.ready = false;
                            $timeout(function() {
                                    countdown(mins - 1);                
                            }, 1000);
                        } else {
                        	scope.timer = false;
                            scope.ready = true;
                        }
                    }
                }
                tick();
            }

            countdown(3);
        }


    };

}]);


/*-----  End of Directive = Timer  ------*/

// ====================== START OF qtyDirective=====================
'use strict';


app.directive('qtyDirective', ['$compile','$timeout', '$rootScope' ,function($compile, $timeout,$rootScope){
    return {
      restrict: 'A',
       scope: { // added to bind quantity from item :  govind
            selectedQtyValue: '=?bind'
        },
      link:function(scope, element, attrs){
        scope.currentStateVal = $rootScope.currentState; // save the currentState value

        // FUNCTION TO CLOSE THE QUANTITY POP UP
      	scope.closeQty=function(){
          $rootScope.currentState = scope.currentStateVal; // reset the currentState value to old saved value
          document.body.style.overflow = "visible";
      		scope.showMe = false;
          $timeout(function() {    
               scope.qtyList.remove(); 
          }, 500);
      		
      	}
      	scope.maxQtyCount = 9; // max count for quantity
      	scope.qtyCount = []; 
        for (var i=1; i< scope.maxQtyCount+1; i++){
            scope.qtyCount.push(i);
        }

      	scope.selectedQty = function(qty){
      		scope.selectedQtyValue = qty; 
      		scope.closeQty(); // close pop up on value select
      	}

      	// click on Quantity button
      	element.on('click',function(){
          $rootScope.currentState = "null"; // Change currentState value = null to stop the swiping feature when Quantity pop up is open
          console.log(scope);
          document.body.style.overflow = "hidden";
      		scope.showMe = true;
      		scope.qtyList = $compile('<div class="overlay" ng-class="{\'showQty\':showMe,\'hideQty\':!showMe}" ng-click="closeQty()"><div class="qty-popup"><div class="popup-header"><span>quantity</span><span ng-click="closeQty()">X</span></div><div class="qty-count-list-wrap"><ul class="qty-count-list"><li ng-repeat="qty in qtyCount" ng-click="selectedQty(qty)">{{qty}}</li></ul></div></div><div>')(scope);
      		scope.$apply();
      		element.parent().append(scope.qtyList); // append to the parent of quantity button
      	});
      	
      }
    };
}]);


    

// ====================== END OF qtyDirective =====================

'use strict';

app.filter('arrayToList', function(){
    return function(arr) {
        return arr.join(',');
    }
});	
// calculationService Start

'use strict';

app.service('calculationService',[ 'lodash' ,function (lodash) {

    //returns total COUNT of an item burger/side/drink
  function  countItems(itemType,localScope) {
        var objects = localScope.orderCart[itemType];
        localScope.count = lodash.sum(objects, function(object) {
            return object.quantity;
        })
        if (localScope.count) return localScope.count;
        return 0;
    };
    //getting count of items in each category(burgers/sides/drinks)
    this.getItemCounts = function(localScope) {
        localScope.itemCount.burgers = countItems('burgers',localScope);
        localScope.itemCount.sides = countItems('sides',localScope);
        localScope.itemCount.drinks = countItems('drinks',localScope);
         localScope.itemCount.total = localScope.itemCount.burgers + localScope.itemCount.sides +localScope.itemCount.drinks; 
    };

    //returns total COST of an item burger/side/drink
   function getItemValue (itemType,localScope) {
        var objects = localScope.orderCart[itemType];
        localScope.itemsCost = lodash.sum(objects, function(object) {
            return object.quantity * object.rate;
        })
        if (localScope.itemsCost) return localScope.itemsCost;
        return 0;

    };

  this.getTotalCartValue = function(localScope) {
        localScope.total = getItemValue('burgers',localScope) + getItemValue('sides',localScope) + getItemValue('drinks',localScope);
        localScope.serviceTax = (localScope.total * localScope.serviceTaxPercent) / 100;
        localScope.grandTotal = localScope.total + localScope.serviceTax;
    };

}]);

// calculationService End
// burgerService Start

'use strict';

app.service('burgerService', ['$http', '$q', function($http, $q) {
    this.getBurgerData = function() {

        var deferred = $q.defer();

        $http.get('images/Data/burgerData.json').success(function(res) {
            deferred.resolve(res);
        }).error(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    this.getRecentBurgerData = function() {

        var deferred = $q.defer();

        $http.get('images/Data/recentburgerData.json').success(function(res) {
            deferred.resolve(res);
        }).error(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}]);

// burgerService End

// drinksService Start

'use strict';

app.service('drinksService', ['$http', '$q', function ($http, $q) {
	this.getDrinksData = function () {
		
		var deferred = $q.defer();

		$http.get('images/Data/drinksData.json').success(function (res) {
			deferred.resolve(res);
		}).error( function (err) {
			deferred.reject(err);
		});
		return deferred.promise;
	}
}]);

// drinksService End
// sidesService Start

'use strict';

app.service('sidesService', ['$http', '$q', function ($http, $q) {
	this.getSidesData = function () {
		
		var deferred = $q.defer();

		$http.get('images/Data/sidesData.json').success(function (res) {
			deferred.resolve(res);
		}).error( function (err) {
			deferred.reject(err);
		});
		return deferred.promise;
	}
}]);

// sidesService End