//TODO: Provide support for profile videos
angular.module('cyclops', ['ngAnimate', 'ui.router', 'Access', 'Home', 'Info', 'Date'])

    .config(function($httpProvider, $stateProvider, $urlRouterProvider){
        $httpProvider.interceptors.push('AuthInterceptor');

        //unhandled urls default to homepage
        $urlRouterProvider.otherwise('/');

        //set the different states
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: '/app/views/partials/home.html'
            })

            .state('index.login', {
                templateUrl: '/app/views/partials/login.html'
            })

            .state('index.userInfo', {
                templateUrl: '/app/views/partials/userInfo.html'
            })

    })

    //might move this if it gets unwieldy
    .controller('leftController', [
        '$state'
        , '$scope'
        , 'Auth'
        , function($state, $scope, Auth){
            /**
             * Keep checking to see if the user is logged in
             * and if they are, change the state.
             */
            $scope.$watch(function(){
                return Auth.isLoggedIn();
            }, function(value){
                if(value == true){
                    $state.go('index.userInfo');
                }

                else{
                    $state.go('index.login');
                }
            });
        }
    ])

    /**
     * specify an index to start from when looping
     * through a list with ngRepeat
     */
    .filter('startIndex', function(){
        return function(arr, start){
            if(arr && start < arr.length){
                return(arr.slice(parseInt(start)));
            }
            return [];
        };
    })

    //to indicate that a url is trusty
    .filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }]);
