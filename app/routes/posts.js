/**
 * This module is responsible for handling posts
 * it allows the client to store posts in the database,
 * update posts, get posts from the database, and
 * delete posts.
 *
 * ==============================================
 * DEPENDENCY INJECTIONS
 * ==============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * @param Post ---------Post Model
 * @param User ---------User Model
 * @param tkRouter -----Token router
 * @param valUser ------Find&Save User to req
 * @param gfs ----------GridFS for storing files
 * @param _ ------------Underscore
 * ==============================================
 * @returns postRouter
 */
module.exports = function(express, mongoose, Post, User, tkRouter, valUser, gfs, _){
    var postRouter = express.Router();

    //get the top 20 posts ranked by number of likes
    postRouter.get('/top50', function(req, res){
        Post.find({})
            .populate('author', 'username profileMedia')
            .sort({'meta.likes':-1})
            .limit(50)
            .exec(function(err, posts){
                if(err) throw err;

                else{
                    res.json({
                        "success": true,
                        "result": posts
                    })
                }
            });

    });

    postRouter.use('/pollTop50', function(req, res, next){
        Post.find({})
            .populate('author', 'username profileMedia')
            .sort({'meta.likes':-1})
            .limit(50)
            .exec(function(err, posts){
                if(err) throw err;

                else{
                    req.top50 = posts;
                    next();
                }
            });

    });

    postRouter.get('/pollTop50', function(req, res){
        var posts = req.top50;
        var count = 0;
        pollMe(req, res, posts, count);
    });

    function pollMe(request, response, oldTop50, depth) {
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
                    if ((notEqual(posts, oldTop50)) || depth >= 45) {
                        //console.log('depth: ' + depth);
                        //console.log('=========================================================');
                        if(depth >= 45 && !notEqual(posts, oldTop50)){
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
                            pollMe(request, response, oldTop50, depth);
                        }, 2000);
                    }
                }
            });
    }

    function notEqual(arr1, arr2){
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

    postRouter.use(tkRouter);

    //gets all posts.
    postRouter.get('/', function(req, res){
        Post.find({}).populate('author', 'username profileMedia')
            .exec(function(err, posts){
                if(err) throw err;

                else{
                    res.json({
                        success: true,
                        result: posts
                    });
                }
            });
    });

    /**
     * validate the user parameter by checking if it's a valid
     * username or password. If it is, save the user to the
     * request for use throughout the router.
     */
    postRouter.param('user', valUser);


    //Allows us to get all posts from :user
    postRouter.get('/user/:user', function(req, res){
        Post.find({author: req.user._id}).populate('author', 'username profileMedia')
            .exec(function(err, posts){
                if(err || !posts){
                    console.log(err);
                    res.json({
                        success: false,
                        message: 'Posts not found'
                    })
                }

                else{
                    res.json({
                        success: true,
                        result: posts
                    })
                }

            });
    });

    /**
     * Validate the postID parameter, find the post with that id
     * if it exists and saves it to req.found
     */
    postRouter.param('postID', function(req, res, next, postID){
        Post.findById(postID).populate('author', 'username profileMedia')
            .exec(function(err, found){
                if(err || !found){
                    res.json({success: false, result: 'Post not found'});
                }

                else{
                    req.found = found;
                    next();
                }
            });
    });

    /**
     * This middleware deletes all the media associated with a
     * post once that post has been deleted
     */
    postRouter.use('/:postID', function(req, res, next){
        if(req.method == 'DELETE'){
            var files = req.found.files;

            if(files.length) {
                for(var i = 0; i < files.length; i++) {
                    gfs.remove({_id: files[i].media}, function (err) {
                        if (err) {
                            res.json({
                                success: false,
                                message: 'Post could not be deleted',
                                error: err.message
                            })
                        }
                    });
                }
            }
        }

        next();
    });

    /**
     * Allows us to get, update or delete
     * the post with id:postID
     */
    postRouter.route('/:postID')
        //get the post
        .get(function(req, res){
            res.json({
                success: true,
                result: req.found
            });
        })

        //update the post
        .put(function(req, res){
            if(req.decoded._id == req.found.author._id) {

                //boolean to determine if there's info to update user with
                var info = false;

                for(item in req.body){
                    if(req.body.hasOwnProperty(item)){
                        info = true;
                        break;
                    }
                }

                if(info) {
                    if (req.body.title) req.found.title = req.body.title;

                    if (req.body.body) req.found.body = req.body.body;

                    if (req.body.dislikes) req.found.meta.dislikes = req.body.dislikes;

                    if (req.body.tags) req.found.tags = req.body.tags.toLowerCase().split(' ');

                    req.found.save(function (err) {//save the post
                        if (err) {
                            res.json({success: false, error: err.message, message: 'Post could not be updated'});
                        }

                        else {
                            res.json({success: true, message: 'Post Updated'});
                        }
                    });
                }

                else {
                    res.json({success: false, message: "Update values were not found"});
                }
            }

            else{
                res.json({success: false, message: "You do not have permission to edit this post"})
            }
        })

        //delete the post
        .delete(function(req, res){
            if(req.decoded._id == req.found.author._id) {//only the author can delete a post
                req.found.remove(function (err) {
                    if (err) {
                        console.log(err);
                        res.json({
                            success: false,
                            message: "Comment could not be deleted"
                        });
                    }

                    else {
                        res.json({
                            success: true,
                            message: 'Post Deleted'
                        })
                    }
                });
            }

            else{//if ur not the author, fuck off
                res.json({
                    success: false,
                    message: 'You do not have permission to delete this post'
                });
            }
        });

    return postRouter;
};