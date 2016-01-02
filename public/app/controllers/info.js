/**
 * Handles information pertaining to the logged in user
 */
angular.module('Info', ['UserService', 'ngResource', 'ConstFactory'])
    .controller('infoController', ['User', '$resource', 'constants', function(User, $resource, constants){
        var mediaUrl = constants.api + "/media/";

        var self = this;
        self.me = {};

        //self.meInfo = User.getMe();

        self.getMediaUrl = function(mediaId){
            return mediaUrl+mediaId;
        };

        self.me.info = User.getMe();

        (function updateMe(me){
            var newMe = $resource(constants.api + "/me/pollInfo");
            newMe.get({}).$promise.then(function(data){
                if(data.success)me.info = data;
                updateMe(me);
            });
        })(self.me);
    }]);