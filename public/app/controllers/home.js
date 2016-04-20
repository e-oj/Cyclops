angular.module('Home', ['Post', 'DateUtils', "PostUtils", 'ngResource', 'ConstFactory', "AlignCards"])
    .controller('homeController', ['top50'
        , '$scope'
        , 'dateUtils'
        , 'postUtils'
        , '$resource'
        , 'constants'
        , "alignCards"
        , "$timeout"
        , function(top50, $scope, dateUtils, postUtils, $resource, constants, alignCards, $timeout){

            var self = this;
            var mediaUrl = constants.api + "/media/";
            self.genericWidth = 0.20834 * screen.availWidth;
            self.top50 = top50;

            $timeout(alignCards.loadCards, 1000);

            angular.element(window).on("resize", function(){
                alignCards.reset();
                alignCards.loadCards();
            });
            //updateMe(self.top50);

            self.getMediaUrl = function(mediaId){
                return mediaUrl+mediaId;
            };

            self.postText = postUtils.addTags;
            self.parseDate = dateUtils.parseDate;
        }
    ])

    //lets us know when ngRepeat is over so we can
    //set cards
    .directive('setCards', [function(){
        return function(scope){
            if(scope.$last){
                scope.$evalAsync(function(){
                    scope.$emit('LastElementReached');
                });
            }
        };
    }]);