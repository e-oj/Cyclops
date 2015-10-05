/**
 * Handles information pertaining to the logged in user
 */
angular.module('Info', ['UserService', 'ngResource', 'ConstFactory'])
    .controller('infoController', ['User', '$resource', 'constants', function(User, $resource, constants){
        var mediaUrl = constants.api + "/media/";

        var self = this;
        self.me = null;

        //self.meInfo = User.getMe();

        self.getMediaUrl = function(mediaId){
            return mediaUrl+mediaId;
        };

        self.meInfo = User.getMe();

        function updateMe(me){
            var newMe = $resource(constants.api + "/me/pollInfo");
            newMe.get({}).$promise.then(function(data){
                self.meInfo = data;
                updateMe(me);
            });
        }

        updateMe(self.meInfo);

    }]);