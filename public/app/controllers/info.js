/**
 * Handles information pertaining to the logged in user
 */
angular.module('Info', ['UserService', 'ngResource', 'ConstFactory'])
  .controller('infoController', ['User', '$resource', 'constants', function(User, $resource, constants){
    var mediaUrl = constants.api + "/media/";

    var self = this;

    //self.meInfo = User.getMe();

    User.getMe(function(info){
      console.log(info);
      self.mediaType = info.result.profileMedia.mediaType;
      self.mediaSrc = getMediaUrl(info.result.profileMedia.media);
      self.username = info.result.username;
      self.profileMsg = info.result.profileMsg;
      self.followers = info.result.followers;
      self.following = info.result.following;
      self.reputation = info.result.reputation;
    });


    function getMediaUrl(mediaId){
      return mediaUrl+mediaId;
    }

    //(function updateMe(me){
    //    var newMe = $resource(constants.api + "/me/pollInfo");
    //    newMe.get({}).$promise.then(function(data){
    //        if(data.success)me.info = data;
    //        updateMe(me);
    //    });
    //})(self.me);
  }]);