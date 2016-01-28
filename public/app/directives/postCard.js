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
                var MAX_HEIGHT = scope.width * 1.5;

                elem.find(".card-header").width(scope.width);

                if(post.author.profileMedia.media) {
                    var mediaId = post.author.profileMedia.media;
                    var mediaType = post.author.profileMedia.mediaType;
                    var multiMedia = elem.find(".multimedia");
                    var profileMedia = elem.find(".profile-media");
                    var media = document.createElement(mediaType == "image"? "img" : "video");
                    var loading = document.createElement("img");

                    multiMedia.width(scope.width);
                    loading.src = "/assets/img/loading.gif";
                    profileMedia.append(loading);

                    media.src = constants.media + "/" + mediaId;
                    media.onload = function(){
                        var $media = angular.element(media);

                        angular.element(loading).replaceWith(media);
                        $media.height($media.width());
                        elem.find(".card-header").height($media.height());

                        username.css({
                            top: -($media.height()/3) + "px"
                        });

                        date.css({
                            top: ($media.height()/2) + "px"
                        });

                        if(scope.width < 400){
                            date.css({
                                fontSize: "0.4em"
                            });
                        }
                    }
                }

                username.html("<p>" + post.author.username + "</p>");
                date.text(dateUtils.parseDate(post.date));

                if(post.files.length){
                    post.files.forEach(function(file){
                        postUtils.loadMedia(scope, multiMedia, file);
                    });
                }

                if(multiMedia.height() > MAX_HEIGHT){
                    multiMedia.css({
                        maxHeight: MAX_HEIGHT
                        , overflowY: "scroll"
                        , overflowX: "hidden"
                    });
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