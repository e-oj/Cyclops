angular.module('Home', ['Post', 'PostUtils', 'ngResource', 'ConstFactory'])
    .controller('homeController', ['top50'
        , '$scope'
        , 'postUtils'
        , '$resource'
        , 'constants'
        , function(top50, $scope, postUtils, $resource, constants){

        var self = this;
        var mediaUrl = constants.api + "/media/";
        self.top50 = top50;

        function updateMe(me){
            var top50 = $resource(constants.api + "/posts/pollTop50");
            top50.get({}).$promise.then(function(data){
                if(data.success) {
                    self.top50 = data;
                }
                updateMe(me);
            });
        }

        updateMe(self.top50);

        var loaded = false;
        $scope.$on('LastElementReached', function(){
            $scope.$evalAsync(function() {
                if(!loaded) {
                    setTimeout(function () {
                        loadCards();
                    }, 5);
                    setTimeout(function () {
                        loadCards();
                    }, 50);
                    setTimeout(function () {
                        loadCards();
                    }, 100);
                    loaded = true;
                }

                setTimeout(function () {
                    loadCards();
                }, 200);
                setTimeout(function () {
                    loadCards();
                }, 1000);
                setTimeout(function () {
                    loadCards();
                }, 5000);
            });
        });

        self.getMediaUrl = function(mediaId){
            return mediaUrl+mediaId;
        };

        self.postText = postUtils.addTags;
        self.parseDate = postUtils.parseDate;
    }])

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