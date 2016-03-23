angular.module('NewPostService', ['ngResource', 'UploadRender'])
    .factory('NewPost', ['$http', '$resource', '$window', 'renderer', function($http, $resource, $window, render){
        var post = {};

        post.files = [];

        post.shelf = function(width, elem){
            var files = elem.find(".file-input")[0].files;

            addFilesAndPreview(files, width, elem);
        };

        post.nonEvent = eventStuff;
        post.drop = function(e, width, elem){
            e.preventDefault();
            e.stopPropagation();

            //jQuery support: the dataTransfer property is not available with jquery events
            var dt = e.dataTransfer? e.dataTransfer : e.originalEvent.dataTransfer;

            addFilesAndPreview(dt.files, width, elem);
        };
        
        var addFilesAndPreview = function(files, width, elem){
            for(var i=0; i<files.length; i++){
                if (render.validFile(files[i])){
                    post.files.push(files[i]);
                }
                console.log(files[i].type);
            }

            render.preview(files, width, post, elem);
        };

        post.saveFiles = function(body, tags, url, elem){
            var sendFile = $resource(url);
            var loadingDiv = document.createElement("div");
                loadingDiv.id = "uploadLoadingDiv";
                loadingDiv = angular.element(loadingDiv);
            var loadingImg = document.createElement("img");
            var loadingMsg = angular.element(document.createElement("p"));
            var uploader = elem.find(".uploader");
            var submit = uploader.find(".upload-button");
                submit.disabled = true;

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
                submit.disabled = false
            };

            elem.find("audio, video").each(function(){this.pause()});

            loadingImg.src = "/assets/img/loading.GIF";
            loadingImg.className = "loading-img";
            loadingMsg.text("Uploading Post...");

            loadingDiv.height(uploader.height());
            loadingDiv.width(uploader.width());
            loadingDiv.addClass("loading-div");
            loadingDiv.append(loadingImg);
            loadingDiv.append(loadingMsg);
            uploader.append(loadingDiv);

            $http.defaults.headers.post['x-access-token'] = $window.localStorage.getItem('token');

            sendFile.save({}, {
                file: post.files
                , body: body
                , tags: tags
            }, function(res){
                loadingFeedback("Post Uploaded");
                console.log(res);
            }, function(err){
                console.log(err);
                loadingFeedback(err.data && err.data.message ? err.data.message : "oops!!! something went wrong");
            });
        };

        function eventStuff(e){
            e.stopPropagation();
            e.preventDefault();
        }

        return post;

    }]);