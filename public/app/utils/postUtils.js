angular.module("PostUtils", ["ngSanitize", "ConstFactory", "AudioPlayer"])
    .factory("postUtils", ["$sce", "$compile", "constants", function($sce, $compile, constants){
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
                    });
                }
            }, 1000);
        };

        utils.parseTags = function(tags){
            var tagHtml = "";

            tags.forEach(function(tag){
                if(tag[0] != "#"){
                    tagHtml += "<span>#" + tag + "</span> ";
                }
                else{
                    tagHtml += "<span>" + tag + "</span> ";
                }
            });
            return tagHtml;
        };

        utils.loadMedia = function(scope, mediaElem, file){
            var dim = file.dimension;
            var mediaDiv = angular.element(document.createElement("div"));
            var loading = document.createElement("img");
            var ASPECT_RATIO = 16/9;
            var width = 0;
            var height = 0;
            var media;
            var audio = false;

            loading.src = "/assets/img/loading.GIF";
            loading.width = scope.width * 0.05;

            if(file.mediaType == "image"){
                media = document.createElement("img");
                //TODO Remove the check for dim. It will always be available in the future
                var useScopeWidth = dim? dim.width > scope.width : true;
                width = useScopeWidth? scope.width : dim.width;
                if(dim) height = useScopeWidth? (width / (dim.width/dim.height)) : dim.height;
                else height = width/ASPECT_RATIO;

                media.width = width;
                media.onload = function(){
                    mediaDiv.css({
                        height: "auto"
                    });
                    angular.element(loading).replaceWith(media);
                };
            }

            else if(file.mediaType == "video"){
                //console.log(file);
                media = document.createElement("video");
                width = scope.width;
                height = width/ASPECT_RATIO;

                media.width = width;
                media.preload = "metadata";

                media.onloadedmetadata = function(){
                    media.id = file.media;
                    media.className += "video-js vjs-default-skin";
                    angular.element(loading).replaceWith(media);
                    videojs(media, {
                        "controls": true
                        , "autoplay": false
                        , "preload": "metadata"
                    });
                    mediaDiv.css({
                        height: "auto"
                    });

                    media.onloadedmetadata = null;
                    console.log("loadedmetadata");
                };
            }

            else if(file.mediaType == "audio"){
                audio = true;
                width = scope.width;
                height = width/4;

                $compile("<oj-audio " +
                    "oj-width=" + width +
                    " oj-src=" + constants.media + "/" + file.media +
                    "></oj-audio>")(scope, function(cloned){
                    mediaDiv.append(cloned);
                });
            }

            mediaDiv.width(width);
            mediaDiv.height(height);

            mediaDiv.css({
                "margin": file.mediaType == "image"? "0 auto 5px auto" : "0 0 5px 0"
            });

            loading.style.display = "block";
            loading.style.margin = "0 auto";
            loading.style.position = "relative";
            loading.style.top = "45%";
            mediaElem.append(mediaDiv);

            if(!audio){
                mediaDiv.append(loading);
                media.src = constants.media + "/" + file.media;
            }
        };

        utils.parseSeconds = function(time){
            if(time < 60) return 0 + ":" + addZero(Math.floor(time));

            var hours = Math.floor(time/3600);
            var mins = Math.floor(time/60);
            var secs = addZero(Math.floor(time - (mins * 60)));
            var parsedTime = hours? addZero(mins) : mins + ":" + secs;

            return hours? hours + ":" + parsedTime : parsedTime;
        };

        var addZero = function(number){
            return number < 10 ? "0" + number : number;
        };

        return utils;
    }]);