angular.module('ConstFactory', [])
    .factory('constants', function(){
        var statics = {};

        statics.api = "/api";

        return statics;
    });