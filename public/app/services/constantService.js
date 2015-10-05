angular.module('ConstFactory', [])
    .factory('constants', function(){
        var statics = {};

        statics.api = "http://localhost:8080/api";

        return statics;
    });