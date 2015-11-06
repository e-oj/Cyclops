angular.module('NewPostService', ['ngResource'])
    .factory('NewPost', ['$http', '$resource', '$window', function($http, $resource, $window){
        var post = {};

        var sendFile = $resource("/api/me/posts");

        post.files = [];

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
                media.width = 200;
            };
            reader.readAsDataURL(file);

            return media;
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