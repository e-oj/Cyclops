angular.module('UserService', ['ngResource', 'ConstFactory'])
    .factory('User', ['$resource','constants', function($resource, constants){
        var userFactory = {};

        userFactory.getMe = function(){
            var meRoute = $resource(constants.api + "/me/info");
            return meRoute.get();
        };

        return userFactory;
    }]);