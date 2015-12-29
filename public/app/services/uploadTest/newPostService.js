angular.module('NewPostService', ['ngResource'])
    .factory('NewPost', ['$http', '$resource', '$window', function($http, $resource, $window){
        var post = {};
        var MEDIA_WIDTH;
        var currIndex = 0;

        post.files = [];

        post.shelf = function(width){
            MEDIA_WIDTH = width;

            var files = $("#file-input")[0].files;

            addFilesAndPreview(files);
        };

        post.nonEvent = eventStuff;
        post.drop = function(e, width){
            MEDIA_WIDTH = width;

            e.preventDefault();
            e.stopPropagation();

            //jQuery support: the dataTransfer property is not available with jquery events
            var dt = e.dataTransfer? e.dataTransfer : e.originalEvent.dataTransfer;

            addFilesAndPreview(dt.files);
        };
        
        function addFilesAndPreview(files){
            for(var i=0; i<files.length; i++){
                if (validFile(files[i])) post.files.push(files[i]);
            }

            preview(files);
        }

        function validFile(file){
            var allowedTypes = ['image', 'video', 'audio'];

            for(var i=0; i<allowedTypes.length; i++){
                if(file.type.toLowerCase().indexOf(allowedTypes[i]) > -1){
                    return true;
                }
            }

            return false;
        }

        function preview(files){
            for(var i=0; i<files.length; i++){
                if(validFile(files[i])){
                    var media = readFile(files[i]);
                    var div = document.createElement("div");

                    div.id = currIndex;
                    currIndex++;
                    div.style.width = MEDIA_WIDTH+"px";
                    div.style.position = "relative";
                    //div.style.marginBottom = "5px";

                    var deleteImg = document.createElement("img");
                    deleteImg.src = "/assets/img/delete.png";
                    deleteImg.alt = "Cancel Selection";
                    deleteImg.width = 50;

                    var style = deleteImg.style;
                    style.margin = 0;
                    style.opacity = 0.5;
                    style.position = "absolute";
                    style.zIndex = 100;
                    style.display = "block";
                    style.background = "beige";
                    style.cursor = "pointer";

                    deleteImg.addEventListener("click", function(){
                        dropMedia(parseInt(this.parentNode.id))
                    });

                    div.appendChild(deleteImg);
                    div.appendChild(media);

                    document.getElementById('preview').appendChild(div);
                }
            }
        }

        function dropMedia(index){
            if(index<0 || index>=post.files.length) return;

            var prevDiv = document.getElementById("preview");

            post.files.splice(index, 1);
            currIndex--;

            prevDiv.removeChild(document.getElementById(""+index));

            for(var i=0; i<prevDiv.children.length; i++) prevDiv.children[i].id = i;
        }

        function readFile(file){
            var media;

            if(file.type.toLowerCase().indexOf('image') > -1) {
                media = document.createElement('img');
            }
            else if(file.type.toLowerCase().indexOf('video') > -1) {
                media = document.createElement('video');
                media.controls = true;
            }
            else if(file.type.toLowerCase().indexOf('audio') > -1) {
                media = document.createElement('audio');
                media.controls = true;
            }

            var reader = new FileReader();
            reader.onload = function(e){
                media.src = e.target.result;
                media.width = MEDIA_WIDTH;
                media.style.margin = 0;
            };
            reader.readAsDataURL(file);

            return media;
        }

        post.saveFiles = function(body, tags, url){
            var sendFile = $resource(url);

            $http.defaults.headers.post['x-access-token'] = $window.localStorage.getItem('token');

            sendFile.save({}, {
                file: post.files
                , body: body
                , tags: tags
            }, function(res){
                console.log(res);
                alert(res.success? 'Post Uploaded' : 'upload failed');
            });
        };

        function eventStuff(e){
            e.stopPropagation();
            e.preventDefault();
        }

        return post;

    }]);