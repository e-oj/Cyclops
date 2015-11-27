angular.module('Home', ['Post', 'DateUtils', 'ngResource', 'ConstFactory'])
    .controller('homeController', ['top50'
        , '$scope'
        , 'dateUtils'
        , '$resource'
        , 'constants'
        , function(top50, $scope, dateUtils, $resource, constants){

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
                            loadCards(true);
                        }, 10);

                        setTimeout(function () {
                            loadCards(true);
                        }, 50);
                        setTimeout(function () {
                            loadCards(true);
                        }, 100);

                        setTimeout(function () {
                            loadCards(true);
                        }, 200);
                        setTimeout(function () {
                            loadCards(true);
                        }, 1000);
                        setTimeout(function () {
                            loadCards(true);
                        }, 5000);

                        loaded = true;
                    }
                    else{
                        loadCards();

                        setTimeout(function () {
                            loadCards();
                        }, 5);
                        setTimeout(function () {
                            loadCards();
                        }, 10);
                        setTimeout(function () {
                            loadCards();
                        }, 15);
                    }

                });
            });

            self.getMediaUrl = function(mediaId){
                return mediaUrl+mediaId;
            };

            self.postText = dateUtils.addTags;
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