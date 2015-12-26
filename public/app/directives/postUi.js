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

    //TODO: Change link to controller?
    .directive("ojPost", ["NewPost", function(newPost){
        return{
            scope: {
                destUrl: '@destUrl'
            }
            , restrict: 'E'
            , replace: false
            , templateUrl: '/app/views/upload.html.html'
            , link: function(scope, elem){
                elem.on("drop", function(e){newPost.drop(e)})
            }
        }
    }]);