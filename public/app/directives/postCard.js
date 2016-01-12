/**
 * @author EmmanuelOlaojo
 * @since 12/30/15
 */

angular.module('PostCard', ["ngResource", "Home", "PostUtils", "DateUtils", "ConstFactory"])
    .directive('ojPostCard', ["$resource"
        , "dateUtils"
        , "postUtils"
        , "constants"
        , function($resource, dateUtils, postUtils, constants){
            var link = function(scope, elem){
                if(!scope.bodyJson)throw new Error("oj-post-card requires a value for the body-json field");
                if(!scope.width)throw new Error("oj-post-card requires a value for the width field");

                elem.width(scope.width);
                var post = angular.fromJson(scope.bodyJson);
                var username = elem.find(".username");
                var date = elem.find(".date");

                elem.find(".card-header").width(scope.width);

                if(post.author.profileMedia.media) {
                    var mediaId = post.author.profileMedia.media;
                    var mediaType = post.author.profileMedia.mediaType;
                    var profileMedia = elem.find(".profile-media");
                    var media = document.createElement(mediaType == "image"? "img" : "video");
                    var loading = document.createElement("img");

                    loading.src = "/assets/img/loading.gif";
                    profileMedia.append(loading);

                    media.src = constants.media + "/" + mediaId;
                    media.onload = function(){
                        angular.element(loading).replaceWith(media);
                        var $media = angular.element(media);
                        $media.height($media.width());
                        elem.find(".card-header").height($media.height());
                        username.css({
                            top: -($media.height()/3) + "px"
                        });
                        date.css({
                            top: ($media.height()/2.5) + "px"
                        });
                    }
                }

                username.html("<p>" + post.author.username + "</p>");
                date.text(dateUtils.parseDate(post.date));

                if(post.files.length){
                    post.files.forEach(function(file){
                        var $mediaDiv = angular.element(document.createElement("div"));
                        var loading = document.createElement("img");
                        var media;

                        loading.src = "/assets/img/loading.gif";

                        if(file.mediaType == "image"){
                            media = document.createElement("img");
                            $mediaDiv.height(file.dimension.height);
                        }
                    })
                }

                elem.find(".text").html("<p>" + postUtils.addTags(post.body) + "</p>");

                var tagsDiv = elem.find(".tag-train");
                tagsDiv.html(postUtils.parseTags(post.tags));
                tagsDiv.on("mouseover", function(){
                    postUtils.moveTags(tagsDiv);
                });
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
            }
        }
    ]);