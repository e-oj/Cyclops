angular.module('UserService', ['ngResource'])
    .factory('User', ['$resource', function($resource){
        var userFactory = {};

        userFactory.getMe = function(){
            var meRoute = $resource("http://localhost:8080/api/me/info");
            return meRoute.get();
        };

        return userFactory;
    }]);