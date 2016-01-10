/**
 * @author EmmanuelOlaojo
 * @since 12/30/15
 */

angular.module('PostCard', ["Home", "ngResource"])
    .directive('ojPostCard', [function(){
        var controller = function(){
            var self = this;

            var data = angular.fromJson(self.bodyJson);
            self.date = data.date;
        };

        var link = function(scope, elem){
            var controller = scope.cardCt;

            if(!controller.bodyJson)throw new Error("oj-post-card requires a value for the body-json field");
            if(!controller.width)throw new Error("oj-post-card requires a value for the width field");

            elem.width(controller.width);
            var data = angular.fromJson(controller.bodyJson);
            var elements = elem.find(".text");

            elements.html("<p>" + data.body + "</p>");
            console.log(elem.height());
        };

        return{
            scope: {
                bodyJson: '@'
                , width: '='
            }
            , templateUrl: '/app/views/templates/card.html'
            , restrict: 'E'
            , replace: true
            , link: link
            , controller: controller
            , controllerAs: 'cardCt'
            , bindToController: true
        }
    }]);