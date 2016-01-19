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
                //TODO Remove the check for dim. It will always be available in the future
                var useScopeWidth = dim? dim.width > scope.width : false;
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
                    console.log("ready");
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
                var pauseImg = document.createElement("img");
                var trackDiv = angular.element(document.createElement("div"));
                var track = document.createElement("input");
                var playing = false;
                var duration = 0;
                media = document.createElement("audio");


                audioDiv.addClass("audio-div");

                mediaImg.src = "/assets/img/music2.svg";
                mediaImg.className = "media-img";

                imgDiv.append(mediaImg);
                imgDiv.addClass("img-div");

                pauseImg.src = "/assets/img/pause.png";
                pauseImg.className = "pause-img";

                playbackDiv.addClass("playback-div");
                playDiv.on("click", function(){
                    if(playing) {
                        media.pause();
                        angular.element(pauseImg).replaceWith(playImg);
                        playing = false;
                    }
                    else{
                        media.play();
                        angular.element(playImg).replaceWith(pauseImg);
                        playing = true;
                    }
                });
                playDiv.addClass("play-div");
                playImg.src = "/assets/img/play.png";
                playImg.className = "play-img";
                playDiv.append(playImg);

                track.type = "range";
                track.min = 0;
                track.max = 1;
                track.step = 0.01;
                track.value = 0;
                track.style.width = "100%";
                track.oninput = function(){
                    media.currentTime = Math.floor(media.duration * (track.value));
                    console.log(media.duration + "-" + media.currentTime);
                };

                trackDiv.append(track);
                trackDiv.css({
                    position: "absolute"
                    , width: "70%"
                    , left: "12%"
                    , top: "32%"
                });

                playbackDiv.append(playDiv);
                playbackDiv.append(trackDiv);

                controlsDiv.addClass("controls-div");
                controlsDiv.append(playbackDiv);

                width = scope.width;
                height = width/4;

                audioDiv.append(imgDiv);
                audioDiv.append(controlsDiv);

                media.oncanplay = function(){
                    angular.element(loading).replaceWith(audioDiv);

                    //cancel out extra width added by border
                    mediaDiv.width(scope.width - 1);

                    duration = media.duration;
                    media.oncanplay = null;
                };

                media.ontimeupdate = function(){
                    track.value = media.currentTime/duration;
                };

                media.onended = function(){
                    angular.element(pauseImg).replaceWith(playImg);
                    playing = false;
                    media.currentTime = 0;
                    track.value = 0;
                }

            }

            mediaDiv.width(width);
            mediaDiv.height(height);
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
            media.src = constants.media + "/" + file.media;
        };

        function mediaConfig(media){

        }

        return utils;
    }]);