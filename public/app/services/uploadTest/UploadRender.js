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

        render.preview = function(files, width, _post){
            if(!MEDIA_WIDTH) MEDIA_WIDTH = width;
            post = _post;

            for(var i=0; i<files.length; i++){
                if(render.validFile(files[i])){
                    var div = document.createElement("div");

                    div.innerHTML = "<p>Processing...</p>";
                    div.id = currIndex;
                    currIndex++;

                    document.getElementById('preview').appendChild(div);

                    display(readFile(files[i]), div);
                }
            }
        };

        var display = function(media, div){
            div.innerHTML = "";
            div.style.width = MEDIA_WIDTH+"px";
            div.style.position = "relative";

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
                dropMedia(parseInt(this.parentNode.id))
            });

            div.appendChild(deleteImg);
            div.appendChild(media);
        };

        render.validFile = function(file){
            var allowedTypes = ['image', 'video', 'audio'];

            for(var i=0; i<allowedTypes.length; i++){
                if(file.type.toLowerCase().indexOf(allowedTypes[i]) > -1){
                    return true;
                }
            }

            return false;
        };

        var dropMedia = function(index){
            if(index<0 || index>=post.files.length) return;

            var prevDiv = document.getElementById("preview");

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