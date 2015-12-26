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

            $scope.$on('LastElementReached', function(){
                $scope.$evalAsync(function() {
                    setTimeout(function () {
                        loadCards();
                    }, 10);

                    setTimeout(function () {
                        loadCards();
                    }, 50);

                    setTimeout(function () {
                        loadCards();
                    }, 100);

                    setTimeout(function () {
                        loadCards();
                    }, 200);

                    setTimeout(function () {
                        loadCards();
                    }, 500);

                    setTimeout(function () {
                        loadCards();
                    }, 1000);

                    setTimeout(function () {
                        loadCards();
                    }, 5000);

                    setTimeout(function () {
                        loadCards();
                    }, 10000);

                    setTimeout(function () {
                        loadCards();
                    }, 20000);

                })
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