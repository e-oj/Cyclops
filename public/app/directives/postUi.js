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

            self.post = function(){
                newPost.saveFiles(self.postBody, self.tags, self.destUrl);
            }
        };

        var link = function(scope, elem){
            var controller = scope.uploadCt;
            var DEFAULT_WIDTH = 280;
            var uploader = elem.find('#uploader');
            var overlay = elem.find('#upload-overlay');

            controller.elem = elem;

            var borderUp = function(e){
                e.preventDefault();
                overlay.css({
                    'width': uploader.width() + 'px'
                    , 'height': uploader.height() + 'px'
                    , 'top': uploader.position().top + 'px'
                    , 'display': 'block'
                    , 'z-index': '1'
                });

                uploader.css({
                    'box-sizing': 'border-box'
                    , 'border': 'darkcyan 2px dashed'
                    , 'background': "lightblue"
                    , 'opacity': '0.5'
                    , 'z-index': '-1'
                });

                overlay.on('dragleave', borderDown);
            };

            var borderDown = function(e){
                if(e) e.preventDefault();

                overlay.css({
                    'display': 'none'
                    , 'z-index': '-1'
                });

                uploader.css({
                    'box-sizing': 'content-box'
                    , 'border': 'none'
                    , 'background': "white"
                    , 'opacity': '1'
                    , 'z-index': '1'
                });

                overlay.off('dragenter');
                overlay.off('dragleave');
            };

            if(!controller.destUrl) throw new Error("A destination url must be specified");

            var fileInput = elem.find('#file-input');

            uploader.on('dragenter', borderUp);
            uploader.on('dragover', newPost.nonEvent);

            uploader.on('drop', function(e){
                newPost.drop(e, controller.width ? controller.width : DEFAULT_WIDTH);
                borderDown(e);
            });

            fileInput.on('click', function(){
                fileInput.val(null);
            });
            fileInput.on('change', function(){
                newPost.shelf(controller.width ? controller.width : DEFAULT_WIDTH);
            });

            if(controller.defaultText){
                var textBody = document.getElementById('post-body');
                textBody.placeholder = controller.defaultText;
            }

            if(controller.noTags){
                var tagInput = document.getElementById('tags');
                tagInput.style.display = 'none'
            }

            if(controller.width){
                var DIFF = 30;

                uploader.width(controller.width);
                elem.find('#post-body').width(controller.width-DIFF);
                elem.find('#tags').width(controller.width-DIFF);
                elem.find('#drop-zone').css({
                    'max-height': (controller.width * 1.5) + "px"
                });
            }

            if(controller.textHeight){
                elem.find('#post-body').height(controller.textHeight);
            }
        };

        return{
            scope: {
                destUrl: '@'
                , defaultText: '@'
                , noTags: '='
                , width: '='
                , textHeight: '='
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