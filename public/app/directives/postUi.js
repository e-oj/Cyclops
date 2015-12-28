angular.module("PostUI", ['NewPostService'])
    .config(['$httpProvider', function($httpProvider){
        var actions = {};
        actions.transformRequest = function(data){
            var formData = new FormData();

            angular.forEach(data, function(value, key){
                if(value instanceof Array && value[0] instanceof File){
                    for(var i=0; i<value.length; i++) {
                        formData.append(key, value[i]);
                        console.log(key + ', ', value);
                    }
                }
                else formData.append(key, value);
            });
            //console.log(formData);
            return formData;
        };

        $httpProvider.defaults.transformRequest = actions.transformRequest;
        $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    }])

    .directive("ojPost", ["NewPost", function(newPost){
        var controller = function(){
            var self = this;
            self.postBody = "";
            self.tags = "";

            self.post =  function(){newPost.saveFiles(self.postBody, self.tags, self.destUrl);}
        };

        var link = function(){
            var dropZone = document.getElementById('uploader');
            var fileInput = document.getElementById('file-input');

            dropZone.addEventListener('dragenter', newPost.nonEvent);
            dropZone.addEventListener('dragover', newPost.nonEvent);
            dropZone.addEventListener('drop', newPost.drop);

            fileInput.addEventListener('click', function(){fileInput.value = null;});
            fileInput.addEventListener('change', newPost.shelf);
        };

        return{
            scope: {
                destUrl: '@destUrl'
            }
            , restrict: 'E'
            , replace: false
            , link: link
            , controller: controller
            , controllerAs: 'uploadCt'
            , bindToController: true
            , templateUrl: '/app/views/templates/upload.html'
        }
    }]);