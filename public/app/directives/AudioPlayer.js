angular.module("AudioPlayer", [])
    .directive("ojAudio", [function(){
        var link = function(scope, elem){
            if(!scope.ojSrc) throw new Error("To use oj-audio, a value must be specified for oj-src");
            if(!scope.ojWidth) throw new Error("To use oj-audio, a value must be specified for oj-width");

            var audio = document.createElement("audio");
            var audioDiv = elem.find(".audio-div");
            var audioImg = audioDiv.find(".audio-img");
            var loadingImg = document.createElement("img");
            var playImg = audioDiv.find(".play-img");
            var trackDiv = audioDiv.find(".track-div");
            var track = angular.element(audioDiv.find(".oj-slider")[0]);
            var progressTracker = angular.element(audioDiv.find(".tracking-div")[0]);
            var timeLeftDiv = audioDiv.find(".time-left-div");
            var volume = angular.element(audioDiv.find(".oj-slider")[1]);
            var volumeTracker = angular.element(audioDiv.find(".tracking-div")[1]);
            var volumeIcon = audioDiv.find(".volume-icon");
            var currTime = 0;
            var loading = false;
            var duration = 0;

            //dimensions of the element
            var dimensions = {
                width: scope.ojWidth
                , height: scope.ojWidth/4
            };

            elem.css(dimensions);
            audioDiv.css(dimensions);

            loadingImg.src = "/assets/img/loading.GIF";
            loadingImg.width = scope.ojWidth * 0.05;
            loadingImg.className = "audio-loading-img";

            playImg.on("click", function(){
                if(audio.paused){
                    audio.src = scope.ojSrc;
                    audio.currentTime = currTime;
                    audio.play();
                    playImg[0].src =  "/assets/img/pause.png";
                }
                else{
                    if(loading){
                        angular.element(loadingImg).replaceWith(audioImg);
                        loading = false;
                    }

                    currTime = audio.currentTime;
                    audio.pause();
                    audio.src = "";
                    playImg[0].src =  "/assets/img/play.png";
                }
            });

            track.on("input", function(){
                audio.currentTime = Math.floor(duration * track.val());
                currTime = audio.currentTime;

                progressTracker.css({
                    width: track.val() * 98 + "%"
                });

                timeLeftDiv.text(parseSeconds(duration - audio.currentTime));
            });

            volume.on("input", function(){
                audio.volume = volume.val();

                volumeTracker.css({
                    width: volume.val() * 98 + "%"
                });
            });

            //The volume level is MAX by default
            volumeTracker.css({width: "98%"});

            volumeIcon.on("click", function(){
                if(audio.muted){
                    audio.muted = false;
                    volumeIcon[0].src = "/assets/img/volume.png";
                }
                else{
                    audio.muted = true;
                    volumeIcon[0].src = "/assets/img/mute.png";
                }
            });

            if(scope.ojImgSrc){
                audioImg[0].src = scope.ojImgSrc;
            }

            //if audio src is an objectURL, free up the space when we don't need it anymore
            if(scope.ojObject){
                audio.addEventListener("canplaythrough", function(){
                    window.URL.revokeObjectURL(scope.ojSrc);
                });
            }

            audio.addEventListener("timeupdate", function(){
                track.val(audio.currentTime/audio.duration);

                progressTracker.css({
                    width: track.val() * 98 + "%"
                });

                timeLeftDiv.text(parseSeconds(audio.duration - audio.currentTime));
            });

            audio.addEventListener("ended", function(){
                playImg.attr("src", "/assets/img/play.png");

                audio.currentTime = 0;
                currTime = 0;
                audio.src = "";

                track.val(0);

                progressTracker.css({
                    width: 0
                });
            });

            audio.addEventListener("waiting", function(){
                loading = true;
                audioImg.replaceWith(loadingImg);
            });

            audio.addEventListener("canplay", function(){
                loading = false;
                angular.element(loadingImg).replaceWith(audioImg);
            });

            var initTime = function(){
                timeLeftDiv.text(parseSeconds(audio.duration - audio.currentTime));
                duration = audio.duration;
                audio.removeEventListener("loadedmetadata", initTime);
            };

            audio.addEventListener("loadedmetadata", initTime);

            var initAudioPlayer = function(){
                if(scope.width < 400){
                    trackDiv.css({
                        width: "55%"
                    });
                }
                else if(scope.width < 500){
                    trackDiv.css({
                        width: "63%"
                    });
                }

                timeLeftDiv.text(scope.ojDuration ? parseSeconds(scope.ojDuration) : "0:00");
            };

            initAudioPlayer();

            audio.preload = "none";
            audio.volume = 1;
            audio.src = scope.ojSrc;
        };

        var parseSeconds = function(time){
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

        return{
            scope: {
                ojSrc: "@"
                , ojWidth: "="
                , ojImgSrc: "@"
                , ojObject: "="
                , ojDuration: "="
            }
            , templateUrl: "/app/views/templates/audioPlayer.html"
            , restrict: "E"
            , replace: true
            , link: link
        }
    }]);