angular.module('UserService', ['ngResource', 'ConstFactory'])
    .factory('User', ['$resource','constants', function($resource, constants){
        var userFactory = {};

        userFactory.getMe = function(callback){
            var meRoute = $resource(constants.api + "/me/info");
            return meRoute.get(callback);
        };

        return userFactory;
    }]);