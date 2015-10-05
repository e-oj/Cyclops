angular.module('Home', ['Post', 'ngSanitize', 'ngResource', 'ConstFactory'])
    .controller('homeController', ['top50'
        , '$scope'
        , '$sce'
        , '$resource'
        , 'constants'
        , function(top50, $scope, $sce, $resource, constants){

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
                }, 5);
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
                }, 100);
            });
        });

        self.getMediaUrl = function(mediaId){
            return mediaUrl+mediaId;
        };

        self.postText = function(text){
            var txtArr = text.split(' ');
            var post = '';

            for(var i = 0; i < txtArr.length; i++){
                if(txtArr[i][0] === '#'){
                    txtArr[i] = '<span class="text-tag">' + txtArr[i] + '</span>'
                }

                post += txtArr[i] + ' ';
            }

            return $sce.trustAsHtml(post);
        };

        function sameDay(date1, date2){
            return date1.substring(0, 15) === date2.substring(0, 15);
        }

        function sameYear(date1, date2){
            return date1.substring(11, 15) === date2.substring(11, 15);
        }

        //might (should) move this into a date service
        self.parseDate = function(date){
            var localDate = new Date(date).toString();
            var splitDate = localDate.split(' GMT')[0].split(' ');
            var postDate = '';
            var period = 'AM';
            var units = splitDate[splitDate.length - 1].substr(0, 5).split(':');
            var hour = parseInt(units[0]);
            var now = new Date(Date.now()).toString();
            var time = hour + ':' + units[1] + ' ' + period;

            if(sameDay(localDate, now)){
                var theDate = new Date(localDate);
                var current = new Date(Date.now());
                var diff = current - theDate;
                var convDiff = Math.floor(diff / (60 * 1000));

                if(convDiff < 60) {

                    if (convDiff < 1)
                        return 'Just now';

                    if (convDiff === 1)
                        return convDiff + ' min.';

                    return convDiff + ' mins.';
                }

                else{
                    convDiff = Math.floor(diff/(60*60*1000 ));
                    if(convDiff === 1)
                        return convDiff + ' hr.';

                    return convDiff + ' hrs.';
                }
            }

            if (hour > 12) {
                hour -= 12;
                period = 'PM';
                time = hour + ':' + units[1] + ' ' + period;
            }

            //if reduceBy is 1, the year is displayed.
            //if reduceBy is 2, the year is not displayed
            var reduceBy = 1;
            if(sameYear(localDate, now))
                reduceBy = 2;

            for (var i = 1; i < splitDate.length - reduceBy; i++) {
                var num = splitDate[i];

                if (num.length === 2)
                    postDate = num + ' ' + postDate + ' ';
                else
                    postDate += num;
            }

            return postDate + ' - ' + time;
        };
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