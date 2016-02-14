/**
 * This module is responsible for handling
 * the logged in user.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param Post ---------Post Model
 * @param Comment ------Comment Model
 * @param Follow -------Follow Model
 * @param User ---------User Model
 * @param multer -------multer
 * @param tkRouter -----Token router
 * @param valUser ------Find&Save User to req
 * @param mediaSuite ---mediaSuite
 * @param pollSuite ----UnderScore Util Lib
 * ============================================
 * @returns meRouter
 */

module.exports = function(Follow, User, Comment, Post, tkRouter, valUser, mediaSuite, multer, pollSuite){
    var meRouter = require('express').Router();

    meRouter.use(tkRouter);

    meRouter.use(function (req, res, next) {
        User.findById(req.decoded._id, function (err, me) {
            if (err || !me) {
                res.json({
                    success: false,
                    result: 'Could not find user'
                });
            }

            else{
                req.me = me;
                next();
            }
        })
    });

    //saves media in a buffer
    meRouter.use(multer({
        putSingleFilesInArray: true
        ,inMemory: true
    }));

    //Perform all necessary operations and save media to GridFS
    meRouter.use(mediaSuite.saveMedia);

    meRouter.get('/pollInfo', function(req, res){
        var me = req.me;
        var count = 0;
        pollSuite.pollMe(req, res, me, count);
    });

    meRouter.route('/info')
        //get the user identified by :user
        .get(function (req, res) {
            //find and return the user wth :userID
            res.json({
                success: true,
                result: req.me
            });
        })

        //update the user identified by :user
        .put(function (req, res) {
            //boolean to determine if there's info to update user with
            var info = false;

            if (req.body.username) {//if there's a new username
                info = true;
                req.me.username = req.body.username;
            }
            if (req.body.password) {//if there's a new password
                info = true;
                req.me.password = req.body.password;
            }
            if (req.body.email) {//if there's a new email
                info = true;
                req.me.email = req.body.email;
            }
            if (req.body.profileMsg) {//if there's a new email
                info = true;
                console.log(req.body.profileMsg.length);
                req.me.profileMsg = req.body.profileMsg;
            }

            if(req.mediaIds.length){
                if(req.me.profileMedia && req.me.profileMedia.media){
                    //console.log("found media: " + req.me.profileMedia);
                    mediaSuite.removeMedia(req.me.profileMedia.media);
                }
                info = true;
                req.me.profileMedia = req.mediaIds[0];
            }

            if(req.body.profileMsg &&  req.body.profileMsg.length  > 500){
                res.json({
                    success: false,
                    message: 'Profile message cannot exceed 500 characters'
                });
            }

            else if (info) {//if there's new information
                req.me.save(function (err) {//save the user.
                    if (err) {
                        console.log(err);
                        res.json({
                            error: err,
                            success: false,
                            message: 'User was not updated'
                        })
                    }
                    else {
                        res.json({
                            success: true,
                            message: 'User updated'
                        })
                    }
                })
            }

            else {
                res.json({
                    success: false,
                    message: 'Update values were not found'
                });
            }
        })

        //delete user from database
        //TODO: Remove all info related to the user before removing the user
        .delete(function (req, res) {
            req.me.remove(function (err) {
                if (err) {
                    res.json({
                        success: false,
                        error: err.message,
                        message: 'User could not be deleted'
                    })
                }

                else {
                    res.json({
                        success: true,
                        message: 'User deleted'
                    })
                }
            });
        });

    meRouter.get('/newsfeed', function(req, res){
        if(req.decoded) {
            var user = req.decoded._id;
            var stream = Follow.find({user: user}).select('follows').stream();

            res.status(200);
            res.set({
                "Content-Type": "application/json"
            });
            res.write("[");

            stream.on('data', function (doc) {
                var postStream = Post.find({author: doc.follows})
                    .populate('author', 'username profileMedia')
                .stream();

                postStream.on('data', function(post){
                    res.write(JSON.stringify({post: post}));
                    res.write(", ");
                });

                postStream.on('error', function (err) {
                    res.write(JSON.stringify({
                        error: err.msg
                        , result: 'Error loading timeline'
                    }));

                    res.end("]");
                });
            });

            //if there's an error
            stream.on('error', function (err) {
                res.json({
                    error: err.msg
                    , result: 'Error loading timeline'
                })
            });

            //when the stream closes, add self to req.users
            stream.on('close', function () {
                var postStream = Post.find({author: user})
                    .populate('author', 'username profileMedia')
                    .stream();

                postStream.on('data', function(post){
                    res.write(JSON.stringify({post: post}));
                    res.write(", ");
                });

                postStream.on('error', function (err) {
                    res.write(JSON.stringify({
                        error: err.msg
                        , result: 'Error loading timeline'
                    }));

                    res.end("]");

                });

                postStream.on('close', function(){
                    res.end("{}]");
                });
            });
        }

        else{
            res.json({success: false, message: 'Not logged in'});
        }
    });

    //saves posts to the database
    meRouter.route('/posts')
        .post(function(req, res){
            if(req.me) {
                var post = new Post();
                var error = {};

                //set the post's properties to info gotten
                //from the request body.
                post.author = req.me._id;
                post.title = req.body.title;
                post.date = Date.now();

                if(!req.body.body && req.mediaIds.length) post.body = " ";
                else post.body = req.body.body;

                if (req.body.tags) post.tags = post.tags.concat((req.body.tags).split(' '));

                if(req.mediaIds.length) post.files = req.mediaIds;

                post.save(function (err) {
                    if (err) { //handles errors
                        console.log("error: " + err);
                        if (err.errors) {
                            error.errors = [];
                            if (err.errors.author) error.errors.push(err.errors.author.message);
                            if (err.errors.title) error.errors.push(err.errors.title.message);
                            if (err.errors.body) error.errors.push(err.errors.body.message);
                            if (err.errors.date) error.errors.push(err.errors.date.message);

                            if (!post.body) res.status(406);
                            else res.status(400);
                            res.send(error);
                        }
                    }

                    else { //if no errors, user is saved
                        res.json({
                            success: true,
                            message: "Post has been uploaded"
                        });
                    }
                });
            }

            else{
                res.json({
                    success: false,
                    message: 'User not logged in'
                });
            }
        })

        //gets all the posts made by the logged in user
        .get(function(req, res){
            if(req.me){
                Post.find({author: req.me._id}).populate('author', 'username profileMedia')
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
            }

            else{
                res.json({
                    success: false,
                    message: 'User not logged in'
                });
            }
        });

    //find a post. Might remove later on account of redundancy
    meRouter.param('postID', function (req, res, next, post) {
        Post.findById(post, function (err, found) {
            if (err || !found) {
                res.json({success: false, result: 'Post not found'});
            }

            else {
                req.found = found;
                next();
            }
        });
    });

    meRouter.route('/comments/:postID')
        //create a new comment on a post
        .post(function (req, res) {
            var comment = new Comment();
            var error = {};

            //set the comment's properties to info gotten
            //from the request body.
            comment.author = req.me._id;
            comment.title = req.body.title;
            comment.body = req.body.body;
            comment.date = Date.now();
            comment.post = req.found._id;

            //save the comment
            comment.save(function (err) {
                if (err) { //handles errors
                    console.log("error: " + err);
                    if (err.errors) {
                        error.errors = [];
                        if (err.errors.author) error.errors.push(err.errors.author.message);
                        if (err.errors.title) error.errors.push(err.errors.title.message);
                        if (err.errors.body) error.errors.push(err.errors.body.message);
                        if (err.errors.date) error.errors.push(err.errors.date.message);
                        if (err.errors.post) error.errors.push(err.errors.post.message);
                        res.send(error.errors);
                    }
                }

                else { //if no errors, comment is saved
                    res.json({
                        success: true,
                        message: "Comment has been uploaded"
                    });
                }
            });

        })

        //get all the comments made by the logged in user on a post
        .get(function(req, res){
            Comment.find({post: req.found._id, author: req.me._id}, function(err, comments){
                if(err){
                    res.json({
                        success: false,
                        result: "Comments not found",
                        error: err.message
                    });
                }

                else{
                    res.json({
                        success: true,
                        result: comments
                    })
                }
            });
        });

    return meRouter;
};