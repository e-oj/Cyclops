/**
 * This module holds the functions required for
 * polling the database fore changes in information.
 *
 * @author Emmanuel Olaojo
 * @param express an instance of express
 * @param User The user model
 * @param Post The Post model
 * @param _ The underscore utility lib
 *
 * @returns the pollSuite object containing the relevant functions
 */

module.exports = function(express, User, Post, _){
    var pollSuite = {};

    /**
     * Checks the database for new information every
     * 2 seconds for within a 90sec period.
     *
     * We retrieve new information and compare it against the
     * information we currently have and if there's a difference
     * i.e if there's new information, we respond with this
     * new information.
     *
     * If there's no new information but the depth is 45
     * i.e 90secs have passed (45*2) we send back a response
     * with the current object.
     *
     * If the information has not changed and the depth is
     * less than 45, we increment the depth and schedule a
     * call to this function, for 2secs from the current time,
     * with the updated depth.
     *
     * @param req the request
     * @param res the response
     * @param oldMe the current information
     * @param depth the number of times this function has been called
     */
    pollSuite.pollMe = function(req, res, oldMe, depth){

        User.findById(req.decoded._id, function (err, me) {
            if (err || !me) {
                //403: forbidden
                res.status(403);

                res.json({
                    success: false,
                    result: 'Could not find user'
                });
            }

            else {
                var equal = !notEqualInfo(me, oldMe);
                if ((!equal || depth >= 45)){
                    if(depth >= 45 && equal){
                        //200: OK
                        res.status(200);

                        res.json({
                            success: false
                        });
                    }
                    else {
                        //205: Reset Content
                        res.status(205);

                        res.json({
                            success: true,
                            result: me
                        });
                    }
                }

                else {
                    setTimeout(function(){
                        depth++;
                        pollSuite.pollMe(req, res, oldMe, depth);
                    }, 2000);
                }
            }
        });
    };

    /**
     * Checks the database for new information every
     * 2 seconds for within a 90sec period.
     *
     * We retrieve new information and compare it against the
     * information we currently have and if there's a difference
     * i.e if there's new information, we respond with this
     * new information.
     *
     * If there's no new information but the depth is 45
     * i.e 90secs have passed (45*2) we send back a response
     * with the current object.
     *
     * If the information has not changed and the depth is
     * less than 45, we increment the depth and schedule a
     * call to this function, for 2secs from the current time,
     * with the updated depth.
     *
     * @param req the request
     * @param res the response
     * @param oldTop50 the current information
     * @param depth the number of times this function has been called
     */
    pollSuite.pollTop50 = function(req, res, oldTop50, depth) {
        Post.find({})
            .populate('author', 'username profileMedia')
            .sort({'meta.likes':-1})
            .limit(50)
            .exec(function (err, posts) {
                if (err || !posts) {
                    //200: OK
                    res.status(200);

                    res.json({
                        success: false,
                        result: 'Could not find posts'
                    });
                }

                else {
                    var equal = !notEqualLists(posts, oldTop50);
                    if ((!equal || depth >= 45)){
                        if(equal){
                            //200: OK
                            res.status(200);

                            res.json({
                                success: false
                            });
                        }
                        else {
                            //200: OK
                            res.status(200);

                            res.json({
                                success: true,
                                result: posts
                            });
                        }
                    }

                    else {
                        setTimeout(function () {
                            depth++;
                            pollSuite.pollTop50(req, res, oldTop50, depth);
                        }, 2000);
                    }
                }
            });
    };

    /**
     * Checks two lists of JSON objects and
     * does a deep comparison for equality.
     *
     * @param arr1 the first array to be checked
     * @param arr2 the second array to be checked
     *
     * @returns true if they're not equal and false otherwise
     */
    function notEqualLists(arr1, arr2){
        if(arr1.length != arr2.length)
            return true;

        /* Converts each JSON object in the list to a
         * JavaScript object and uses Underscore to check
         * for equality.
         */
        for(var i = 0; i < arr1.length; i++) {
            var obj1 = JSON.parse(JSON.stringify(arr1[i]));
            var obj2 = JSON.parse(JSON.stringify(arr2[i]));
            if(!_.isEqual(obj1, obj2)){
                return true;
            }
        }

        return false;
    }


    /**
     * Checks two JSON objects and
     * does a deep comparison for equality.
     *
     * @param me1 the JSON object to be checked
     * @param me2 the second JSON object to be checked
     *
     * @returns true if they're not equal and false otherwise
     */
    function notEqualInfo(me1, me2){
        var obj1 = JSON.parse(JSON.stringify(me1));
        var obj2 = JSON.parse(JSON.stringify(me2));

        return !_.isEqual(obj1, obj2);
    }

    return pollSuite;
};