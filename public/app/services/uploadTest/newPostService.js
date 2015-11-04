angular.module('NewPostService', ['ngResource'])
    .factory('NewPost', ['$http', '$resource', '$window', function($http, $resource, $window){
        var post = {};

        var sendFile = $resource("/api/me/posts");

        //post.previewIndex = 0;
        post.files = [];

        //post.shelf = function() {
        //    post.files = $('#file')[0].files;
        //    preview(post.files);
        //    //saveFile(self.files);
        //};

        post.nonEvent = eventStuff;
        post.drop = function(e){
            e.preventDefault();
            e.stopPropagation();

            var dt = e.dataTransfer;

            for(var i=0; i<dt.files.length; i++){
                post.files.push(dt.files[i]);
                console.log(dt.files.length);
                console.log(dt.files[i].type);
                console.log(dt.files[i]);
                console.log(validFile(dt.files[i]));
            }
            preview(dt.files);
        };

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
                    var file = files[i];
                    //alert('Starting preview');
                    if(file.type.toLowerCase().indexOf('image') > -1) {
                        var img = readFile(files[i]);
                        document.getElementById('preview').appendChild(img);
                    }
                    else if(file.type.toLowerCase().indexOf('video') > -1) {
                        var vid = readFile(files[i]);
                        document.getElementById('preview').appendChild(vid);
                    }
                    else if(file.type.toLowerCase().indexOf('audio') > -1) {
                        var aud = readFile(files[i]);
                        document.getElementById('preview').appendChild(aud);
                    }
                }
            }
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
                if(file.type.indexOf("gif") === -1 && file.type.indexOf("image") > -1 )
                    media =  resize(media);
                //else{
                //    post.fileList.push(media.src);
                //    console.log("Length: " + post.fileList.length);
                //}
            };
            reader.readAsDataURL(file);

            return media;
        }

        function resize(img){
            //alert("resizing");
            var canvas = document.createElement("canvas");
            var MAX_WIDTH = 500;
            var width = img.width;
            var height = img.height;
            var ratio = width/height;

            if(width > MAX_WIDTH){
                width = MAX_WIDTH;
                height = MAX_WIDTH/ratio;
            }

            //img.width = width;
            //img.height = height;

            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            //alert(canvas.mozGetAsFile());
            img.src = canvas.toDataURL("image");
            //post.fileList.push(img.src);
            //console.log(post.fileList.length);
            return img;
        }

        post.saveFiles = function(body, tags){
            $http.defaults.headers.post['x-access-token'] = $window.localStorage.getItem('token');

            sendFile.save({}, {file: post.files
                , body: body
                , tags: tags}, function(res){
                console.log(res);
            });

            alert('Post Uploaded');
        };

        function eventStuff(e){
            console.log('in');
            e.stopPropagation();
            e.preventDefault();
        }

        return post;

    }]);