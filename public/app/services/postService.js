/**
 * Created by NILS on 7/24/2015.
 */

angular.module('Post', ['ngResource', 'ConstFactory'])
    .factory('top50', ['$resource','constants', function($resource, constants){
        var postRoute = $resource(constants.api + "/posts/top50");
        return postRoute.get({});
    }]);