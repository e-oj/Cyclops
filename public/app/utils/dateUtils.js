angular.module("DateUtils", ["ngSanitize"])
    .factory("dateUtils", ["$sce", function($sce){
        var utils = {};

        utils.addTags = function(text){
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

        utils.parseDate = function(date){
            if(!date) return "None";

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
                //convert time to minutes
                var convDiff = Math.floor(diff / (60 * 1000));

                //if less than 60 mins
                if(convDiff < 60) {

                    //if it's less than one min, it happened just now
                    if (convDiff < 1)
                        return 'Just now';

                    //if it's one min, use the singular min
                    if (convDiff === 1)
                        return convDiff + ' min.';

                    return convDiff + ' mins.';
                }

                //if time > 60 mins(1hr) we speak in hours
                else{
                    //convert to hrs
                    convDiff = Math.floor(diff/(60*60*1000 ));

                    //if it's one hr, use the singular hr
                    if(convDiff === 1)
                        return convDiff + ' hr.';

                    return convDiff + ' hrs.';
                }
            }

            //convert from 24hr clock to 12hr clock
            if (hour > 12) {
                hour -= 12;
                period = 'PM';
                time = hour + ':' + units[1] + ' ' + period;
            }

            //if reduceBy is 1, the year is displayed.
            //if reduceBy is 2, the year is not displayed
            var reduceBy = sameYear(localDate, now)? 2 : 1;

            for (var i = 1; i < splitDate.length - reduceBy; i++) {
                var num = splitDate[i];

                if (num.length === 2)
                    postDate = num + ' ' + postDate + ' ';
                else
                    postDate += num;
            }

            return postDate + ' - ' + time;
        };

        function sameDay(date1, date2){
            return date1.substring(0, 15) === date2.substring(0, 15);
        }

        function sameYear(date1, date2){
            return date1.substring(11, 15) === date2.substring(11, 15);
        }

        return utils;
    }]);