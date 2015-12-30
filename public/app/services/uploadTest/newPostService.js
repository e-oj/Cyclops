angular.module('NewPostService', ['ngResource', 'UploadRender'])
    .factory('NewPost', ['$http', '$resource', '$window', 'renderer', function($http, $resource, $window, render){
        var post = {};

        post.files = [];

        post.shelf = function(width){
            var files = $("#file-input")[0].files;

            addFilesAndPreview(files, width);
        };

        post.nonEvent = eventStuff;
        post.drop = function(e, width){
            e.preventDefault();
            e.stopPropagation();

            //jQuery support: the dataTransfer property is not available with jquery events
            var dt = e.dataTransfer? e.dataTransfer : e.originalEvent.dataTransfer;

            addFilesAndPreview(dt.files, width);
        };
        
        var addFilesAndPreview = function(files, width){
            for(var i=0; i<files.length; i++){
                if (render.validFile(files[i])) post.files.push(files[i]);
            }

            render.preview(files, width, post);
        };

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