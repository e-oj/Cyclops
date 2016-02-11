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

            var dimensions = {
                width: scope.ojWidth
                , height: scope.ojWidth/4
            };

            elem.css(dimensions);
            audioDiv.css(dimensions);

            loadingImg.src = "/assets/img/loading.GIF";
            loadingImg.width = scope.ojWidth * 0.05;
            loadingImg.className = "audio-loading-img";
            audioDiv.replaceWith(loadingImg);


            playImg.on("click", function(){
                if(audio.paused){
                    audio.play();
                    playImg[0].src =  "/assets/img/pause.png";
                }
                else{
                    audio.pause();
                    playImg[0].src =  "/assets/img/play.png";
                }
            });

            track.on("input", function(){
                audio.currentTime = Math.floor(audio.duration * track.val());

                progressTracker.css({
                    width: track.val() * 98 + "%"
                });

                timeLeftDiv.text(parseSeconds(audio.duration - audio.currentTime));
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
                console.log("volumeIcon");
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

            audio.addEventListener("timeupdate", function(){
                track.val(audio.currentTime/audio.duration);

                progressTracker.css({
                    width: track.val() * 98 + "%"
                });

                timeLeftDiv.text(parseSeconds(audio.duration - audio.currentTime));
            });

            audio.addEventListener("ended", function(){
                playImg.attr("src", "/assets/img/pause.png");
                audio.currentTime = 0;
                track.val(0);
                progressTracker.css({
                    width: 0
                });
            });

            audio.addEventListener("loadedmetadata", function(){
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

                timeLeftDiv.text(parseSeconds(audio.duration));

                audio.removeEventListener("loadedmetadata");

                angular.element(loadingImg).replaceWith(audioDiv);
            });

            audio.preload = "metadata";
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
            }
            , templateUrl: "/app/views/templates/audioPlayer.html"
            , restrict: "E"
            , replace: false
            , link: link
        }
    }]);