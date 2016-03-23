/**
 * @author EmmanuelOlaojo
 * @since 12/29/15
 */

angular.module("UploadRender", [])
    .factory("renderer", [function(){
        var render = {};
        var currIndex = 0;
        var MEDIA_WIDTH;
        var post;
        var MAX_FILE_SIZE = 1500000000;

        render.preview = function(files, width, _post, elem){
            if(!MEDIA_WIDTH) MEDIA_WIDTH = width;
            post = _post;

            for(var i=0; i<files.length; i++){
                if(render.validFile(files[i], true)){
                    var div = document.createElement("div");

                    div.innerHTML = "<p>Processing...</p>";
                    div.id = currIndex;
                    currIndex++;

                    elem.find('.preview').append(div);

                    display(readFile(files[i]), div, elem);
                }
            }
        };

        var display = function(media, div, elem){
            div.innerHTML = "";
            div.style.width = MEDIA_WIDTH+"px";
            div.style.position = "relative";
            div.style.margin = 0;

            var deleteImg = document.createElement("img");
            deleteImg.src = "/assets/img/delete.png";
            deleteImg.alt = "Cancel Selection";
            deleteImg.width = 50;

            var style = deleteImg.style;
            style.margin = 0;
            style.opacity = 0.5;
            style.position = "absolute";
            style.zIndex = 1;
            style.display = "block";
            style.background = "beige";
            style.cursor = "pointer";

            deleteImg.addEventListener("click", function(){
                dropMedia(parseInt(this.parentNode.id), elem)
            });

            div.appendChild(deleteImg);
            div.appendChild(media);
        };

        //TODO: Add view for error message
        render.validFile = function(file, showErr){
            var allowedTypes = ['image', 'video', 'audio'];
            var isValid = false;

            for(var i=0; i<allowedTypes.length; i++){
                if(file.type.toLowerCase().indexOf(allowedTypes[i]) > -1){
                    isValid = true;
                }
            }

            if(!isValid && showErr){
                alert(file.name + " has an unsupported format");
                return isValid
            }

            isValid = isValid && file.size <= MAX_FILE_SIZE;

            if(!isValid && showErr){
                console.log(file);
                alert(file.name + " is too large");
            }

            return isValid;
        };

        var dropMedia = function(index, elem){
            if(index<0 || index>=post.files.length) return;

            var prevDiv = elem.find(".preview")[0];

            post.files.splice(index, 1);
            currIndex--;

            prevDiv.removeChild(document.getElementById(""+index));

            for(var i=0; i<prevDiv.children.length; i++) prevDiv.children[i].id = i;
        };

        var readFile = function(file){
            if(render.validFile(file)){
                var media;
                var audio = false;

                if (file.type.toLowerCase().indexOf('image') > -1) {
                    media = document.createElement('img');
                }
                else if (file.type.toLowerCase().indexOf('video') > -1) {
                    media = document.createElement('video');
                    media.type = file.type;
                    media.controls = true;
                }
                else if (file.type.toLowerCase().indexOf('audio') > -1) {
                    audio = true;
                    media = document.createElement("audio");
                    media.type = file.type;
                    media.controls = true;
                }

                media.src = window.URL.createObjectURL(file);
                media.style.width = audio ? "80%" : "100%";
                media.onload = function(){
                    window.URL.revokeObjectURL(media.src);
                };

                return media;
            }
        };

        return render;
    }]);