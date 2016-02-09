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
            var loadingDiv = document.createElement("div");
                loadingDiv.id = "uploadLoadingDiv";
                loadingDiv = angular.element(loadingDiv);
            var loadingImg = document.createElement("img");
            var loadingMsg = angular.element(document.createElement("p"));
            var elem = angular.element("#uploader");

            var loadingFeedback = function(message){
                var confirm = angular.element(document.createElement("button"));
                var confirmMsg = angular.element(document.createElement("p"));

                confirm.addClass("confirm-button");
                confirm.text("Done");
                confirm.on("click", function(){
                    loadingDiv.remove();
                });

                confirmMsg.text(message);

                angular.element(loadingImg).remove();
                loadingMsg.remove();
                loadingDiv.append(confirmMsg);
                loadingDiv.append(confirm);
            };

            loadingImg.src = "/assets/img/loading.GIF";
            loadingImg.className = "loading-img";
            loadingMsg.text("Uploading Post...");

            loadingDiv.height(elem.height());
            loadingDiv.width(elem.width());
            loadingDiv.addClass("loading-div");
            loadingDiv.append(loadingImg);
            loadingDiv.append(loadingMsg);
            elem.append(loadingDiv);

            $http.defaults.headers.post['x-access-token'] = $window.localStorage.getItem('token');

            sendFile.save({}, {
                file: post.files
                , body: body
                , tags: tags
            }, function(res){
                loadingFeedback("Post Uploaded");
                console.log(res);
            }, function(err){
                loadingFeedback(err.status == 403? "You are not logged in" : "ooops!! Something went wrong");
            });
        };

        function eventStuff(e){
            e.stopPropagation();
            e.preventDefault();
        }

        return post;

    }]);