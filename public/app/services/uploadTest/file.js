angular.module('File', ['ngResource', 'NewPostService'])
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

    .controller('FileCtrl', ['NewPost', function(NewPost) {
        var self = this;
        self.postBody = "";
        self.tags = "";

        self.shelf = NewPost.shelf;
        self.drop = function(e){NewPost.drop(e);};
        self.nonEvent = function(e){NewPost.nonEvent(e);};
        self.post =  function(){NewPost.saveFiles(self.postBody, self.tags, "/api/me/posts");}
    }]);

