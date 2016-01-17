angular.module("PostUtils", ["ngSanitize", "ConstFactory"])
    .factory("postUtils", ["$sce", "constants", function($sce, constants){
        var utils = {};

        utils.addTags = function(text){
            var txtArr = text.trim().split(' ');
            var post = '';

            for(var i = 0; i < txtArr.length; i++){
                if(txtArr[i][0] === '#'){
                    txtArr[i] = '<span class="text-tag">' + txtArr[i] + '</span>'
                }

                post += txtArr[i] + ' ';
            }

            return $sce.trustAsHtml(post);
        };

        utils.moveTags = function($elem){
            setTimeout(function(){
                var container = $elem.parent().closest('div');
                var elemWidth = 0;
                var containerWidth = container.width();

                //gets the real width of the element
                $elem.children().each(function(){
                    elemWidth += $(this).width();
                });

                //can move if its real width is greater than 0.9 of it's containers width
                var movable = elemWidth > (containerWidth * 0.9);
                if(movable){
                    var distance = elemWidth - containerWidth;
                    if(distance < 0) distance = 0;

                    $elem.css({
                        'transition': 'all 2s ease-in-out'
                        , 'position': 'relative'
                        , 'left': -distance - 20 + 'px'
                        , 'padding': "5px 0px 5px 0px"
                    });

                    $elem.mouseleave(function(){
                        setTimeout(function(){
                            $elem.css({
                                'left': 0
                            })
                        }, 1000);
                    })
                }
            }, 1000);
        };

        utils.parseTags = function(tags){
            var tagHtml = "";

            tags.forEach(function(tag){
                if(tag[0] != "#"){
                    tagHtml += "<span>#" + tag + "</span> ";
                }
            });
            return tagHtml;
        };

        utils.loadMedia = function(scope, mediaElem, file){
            var dim = file.dimension;
            var mediaDiv = angular.element(document.createElement("div"));
            var loading = document.createElement("img");
            var ASPECT_RATIO = 1.7;
            var width = 0;
            var height = 0;
            var media;

            loading.src = "/assets/img/loading.gif";
            loading.width = scope.width * 0.05;

            if(file.mediaType == "image"){
                media = document.createElement("img");
                var useScopeWidth = dim.width > scope.width;
                width = useScopeWidth? scope.width : dim.width;
                height = useScopeWidth? (width / (dim.width/dim.height)) : dim.height;

                media.width = width;
                media.onload = function(){
                    angular.element(loading).replaceWith(media);
                };
            }

            else if(file.mediaType == "video"){
                //console.log(file);
                media = document.createElement("video");
                width = scope.width;
                height = width/ASPECT_RATIO;

                media.width = width;
                media.oncanplay = function(){
                    media.id = file.media;
                    media.className += "video-js vjs-default-skin";
                    angular.element(loading).replaceWith(media);
                    videojs(media, {
                        "controls": true
                        , "autoplay": false
                        , "preload": "metadata"
                    }, function(){

                    });
                    mediaDiv.css({
                        height: "auto"
                    });
                    media.oncanplay = null;
                };
            }

            else if(file.mediaType == "audio"){
                var audioDiv = angular.element(document.createElement("div"));
                var mediaImg = document.createElement("img");
                var imgDiv = angular.element(document.createElement("div"));
                var controlsDiv = angular.element(document.createElement("div"));
                var playbackDiv = angular.element(document.createElement("div"));
                var playDiv = angular.element(document.createElement("div"));
                var playImg = document.createElement("img");

                audioDiv.addClass("audio-div");

                mediaImg.src = "/assets/img/music2.svg";
                mediaImg.className = "media-img";

                imgDiv.append(mediaImg);
                imgDiv.addClass("img-div");


                controlsDiv.css({
                    position: "absolute"
                    , width: "75%"
                    , left: "25%"
                    , height: "inherit"
                    , backgroundColor: "lightgray"
                });

                media = document.createElement("audio");
                width = scope.width;
                height = width/4;

                audioDiv.append(imgDiv);
                audioDiv.append(controlsDiv);

                media.oncanplay = function(){
                    angular.element(loading).replaceWith(audioDiv);

                    //cancel out extra width/height added by border
                    mediaDiv.width(scope.width - 2);
                    mediaDiv.height(scope.height - 2);

                    media.play();
                    setTimeout(function(){
                        media.pause();
                    }, 10000);
                };

            }

            mediaDiv.width(width);
            mediaDiv.height(height);
            media.src = constants.media + "/" + file.media;
            //if(file.mediaType == "video" || file.mediaType == "audio")console.log(media.src);


            mediaDiv.css({
                "margin": "0 auto 5px auto"
            });

            loading.style.display = "block";
            loading.style.margin = "0 auto";
            loading.style.position = "relative";
            loading.style.top = "45%";
            mediaDiv.append(loading);
            mediaElem.append(mediaDiv);
        };

        function mediaConfig(media){

        }

        return utils;
    }]);