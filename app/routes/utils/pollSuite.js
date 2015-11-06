module.exports = function(express, User, Post, _){
    var pollSuite = {};

    pollSuite.pollMe = function(request, response, oldMe, depth){
        User.findById(request.decoded._id, function (err, me) {
            if (err || !me) {
                response.json({
                    success: false,
                    result: 'Could not find user'
                });
            }

            else {
                if ((notEqualInfo(me, oldMe)) || depth >= 45) {
                    response.json({
                        success: true,
                        result: me
                    });
                }

                else {
                    setTimeout(function(){
                        depth++;
                        pollSuite.pollMe(request, response, oldMe, depth);
                    }, 2000);
                }
            }
        });
    };
    
    pollSuite.pollTop50 = function(request, response, oldTop50, depth) {
        Post.find({})
            .populate('author', 'username profileMedia')
            .sort({'meta.likes':-1})
            .limit(50)
            .exec(function (err, posts) {
                //console.log()
                //console.log('depth: ' + depth);
                //console.log('==================================================================================================================');
                if (err || !posts) {
                    response.json({
                        success: false,
                        result: 'Could not find posts'
                    });
                }

                else {
                    //console.log('Posts: ');
                    //console.log(oldTop50.slice(0, 5));
                    if ((notEqualLists(posts, oldTop50)) || depth >= 45) {
                        //console.log('depth: ' + depth);
                        //console.log('=========================================================');
                        if(depth >= 45 && !notEqualLists(posts, oldTop50)){
                            response.json({
                                success: false
                            });
                        }
                        else {
                            response.json({
                                success: true,
                                result: posts
                            });
                        }
                    }

                    else {
                        setTimeout(function () {
                            depth++;
                            pollSuite.pollTop50(request, response, oldTop50, depth);
                        }, 2000);
                    }
                }
            });
    };

    function notEqualLists(arr1, arr2){
        if(arr1.length != arr2.length)
            return true;

        for(var i = 0; i < arr1.length; i++) {
            var obj1 = JSON.parse(JSON.stringify(arr1[i]));
            var obj2 = JSON.parse(JSON.stringify(arr2[i]));
            if(!_.isEqual(obj1, obj2)){
                return true;
            }
        }

        return false;
    }



    function notEqualInfo(me1, me2){
        var obj1 = JSON.parse(JSON.stringify(me1));
        var obj2 = JSON.parse(JSON.stringify(me2));

        return !_.isEqual(obj1, obj2);
    }

    return pollSuite;
};