angular.module('ConstFactory', [])
    .factory('constants', function(){
        var statics = {};

        statics.api = "/api";
        statics.media = statics.api + "/media";

        return statics;
    });