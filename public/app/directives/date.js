angular.module("Date", [])
    .directive("date", function(){
        return{
            scope: {}
            , restrict: 'E'
            , replace: true
            , template: '<span class="date">{{home.parseDate(post.date)}}</span>'
        }
    });