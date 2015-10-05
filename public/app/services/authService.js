angular.module('authService', ['ngResource'])
    //===========================================
    // auth factory to login and get information
    // inject $http for communicating with the api
    // inject $q to return promise objects
    // inject AuthToken to to manage tokens
    // ==========================================
    .
    config(['$resourceProvider', function($resourceProvider) {
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }])

    .factory('Auth', ['$resource', 'AuthToken', function($resource, AuthToken){

        //create auth factory object
        var authFactory = {};

        //handle login
        authFactory.login = function(credentials, reply){
            //return the promise object and it's data
            var loginRoute = $resource("http://localhost:8080/api/access/login");
            //setTimeout(function() {
                loginRoute.save({}, credentials, function (res, resHeaders) {
                    if (res.success) {
                        AuthToken.setToken(res.token);
                        reply.message = res.message;
                        reply.failed = false;
                        //console.log(res);
                    }

                    else {
                        reply.message = res.message;
                        reply.failed = true;
                        console.log("404 not found");
                    }
                    reply.processing = false;
                });
            //}, 10000);
        };

        //handle logout by clearing token
        authFactory.logout = function(){
            //clear the token
            AuthToken.setToken();
        };

        //check if a user is logged in
        //checks if there's a local token
        authFactory.isLoggedIn = function(){
            if(AuthToken.getToken())
                return true;
            else
                return false;
        };

        return authFactory;
    }])

    // ==========================================
    // factory for handling tokens
    // inject $window to store token client-side
    // ==========================================
    .factory('AuthToken', function($window){
        var authTokenFactory = {};

        //get the token out of local storage
        authTokenFactory.getToken = function(){
            return $window.localStorage.getItem('token');
        };

        //set the token or clear the token
        // if a token is passed, set the token
        // if there's no token, clear it from local storage
        authTokenFactory.setToken = function(token){
            if(token)
                $window.localStorage.setItem('token', token);
            else
                $window.localStorage.removeItem('token');
        };

        return authTokenFactory;
    })

    // =========================================
    // application configuration to integrate token into requests
    // =========================================
    .factory('AuthInterceptor', function($q, $location, AuthToken){
        var interceptorFactory = {};

        // this will happen on all HTTP requests
        interceptorFactory.request = function(config){
            //grab the token
            var token = AuthToken.getToken();

            //if the token exists, add it to the header as x-access-token
            if(token)
                config.headers['x-access-token'] = token;

            return config;
        };

        // happens on response errors
        interceptorFactory.responseError = function(response){
            //if our server returns a 403 forbidden response
            if(response.status == 403){
                AuthToken.setToken();
                $location.path('/');
            }

            //return the errors from the server as a promise
            return $q.reject(response);
        };

        return interceptorFactory;
    });