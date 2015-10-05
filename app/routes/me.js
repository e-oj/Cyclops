/**
 * This module is responsible for handling
 * the logged in user.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * @param Post ---------Post Model
 * @param Comment ------Comment Model
 * @param Follow -------Follow Model
 * @param User ---------User Model
 * @param multer -------multer
 * @param tkRouter -----Token router
 * @param valUser ------Find&Save User to req
 * @param mediaSuite ---mediaSuite
 * ============================================
 * @returns meRouter
 */

module.exports = function(express, mongoose, Follow, User, Comment, Post, tkRouter, valUser, mediaSuite, multer, _){
    var meRouter = express.Router();

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

    //upload media to ./uploads (temporarily)
    meRouter.use('/info', multer({
        dest: './uploads/',
        putSingleFilesInArray: true
    }));

    //stream files from ./uploads to GridFS
    meRouter.use('/info', mediaSuite.saveMedia);

    meRouter.get('/pollInfo', function(req, res){
        var me = req.me;
        var count = 0;
        pollMe(req, res, me, count);
    });

    function pollMe(request, response, oldMe, depth){
        User.findById(request.decoded._id, function (err, me) {
            //console.log()
            //console.log('depth: ' + depth);
            //console.log('==================================================================================================================');
            if (err || !me) {
                response.json({
                    success: false,
                    result: 'Could not find user'
                });
            }

            else {
                if ((notEqual(me, oldMe)) || depth >= 45) {
                    //console.log('depth: ' + depth);
                    //console.log('=========================================================');
                    response.json({
                        success: true,
                        result: me
                    });
                }

                else {
                    setTimeout(function(){
                        depth++;
                        pollMe(request, response, oldMe, depth);
                    }, 2000);
                }
            }
        });
    }

    function notEqual(me1, me2){
        var obj1 = JSON.parse(JSON.stringify(me1));
        var obj2 = JSON.parse(JSON.stringify(me2));

        return !_.isEqual(obj1, obj2);
    }

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
                if(req.me.profileMedia) mediaSuite.removeMedia(req.me.profileMedia.media);
                info = true;
                req.me.profileMedia = req.mediaIds[0];
            }

            if(req.body.profileMsg &&  req.body.profileMsg.length  > 200){
                res.json({
                    success: false,
                    message: 'Profile message cannot exceed 200 characters'
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

    //get the people that the user follows and add them to req.users
    meRouter.use('/newsfeed', function(req, res, next){
        req.users = [];

        if(req.decoded) {
            var user = req.decoded._id;
            var stream = Follow.find({user: user}).select('follows').stream();

            //when a new document comes in add the necessary info to req.users
            stream.on('data', function (doc) {
                req.users.push(doc.follows)
            });

            //if there's an error
            stream.on('error', function (err) {
                res.json({
                    error: err.msg,
                    result: 'Could not load timeline'
                })
            });

            //when the stream closes, add self to req.users
            stream.on('close', function () {
                req.users.push(user);
                next();
            });
        }

        else{
            res.json({success: false, message: 'Not logged in'});
        }
    });

    meRouter.get('/newsfeed', function(req, res){
        Post.find({})
            .where('author')
            .in(req.users)
            .populate('author', 'username profileMedia')
            .exec(function(err, posts){
                if(err) throw err;

                if(posts){
                    res.json({success: true, result: posts});
                }
            });
    });

    //upload media to ./uploads (temporarily)
    meRouter.use('/posts', multer({
        dest: './uploads/',
        putSingleFilesInArray: true
    }));

    //stream files from ./uploads to GridFS
    meRouter.use('/posts', mediaSuite.saveMedia);

    //saves posts to the database
    meRouter.route('/posts')
        .post(function(req, res){
            console.log(req.files);
            if(req.me) {
                var post = new Post();
                var error = {};

                //set the post's properties to info gotten
                //from the request body.
                post.author = req.me._id;
                post.title = req.body.title;
                post.date = Date.now();

                if(!req.body.body && req.files['file']) post.body = " ";
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
                            res.send(error.errors);
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

    //get all the users the person is following
    meRouter.get('/following', function(req, res){
        Follow.find({user: req.decoded._id})
            .populate('follows', 'username')
            .select('follows -_id')
            .exec(function(err, users){
                if(err || !users){
                    res.json({
                        success: false,
                        result: 'request could not be completed'
                    });
                }

                else{
                    res.json({
                        success: true,
                        result: users
                    });
                }
            });
    });

    //get all the users following the person
    meRouter.get('/followers', function(req, res){
        Follow.find({follows: req.decoded._id})
            .populate('user', 'username')
            .select('user -_id')
            .exec(function(err, users){
                if(err || !users){
                    res.json({
                        success: false,
                        result: 'request could not be completed'
                    });
                }

                else{
                    res.json({
                        success: true,
                        result: users
                    });
                }
            });
    });

    meRouter.param('user', valUser);

    meRouter.route('/follow/:user')
        //follow a user
        .post(function(req, res){
            var follow = new Follow();

            //get information from request body
            follow.user = req.decoded._id;
            follow.follows = req.user._id;

            Follow.findOne({user: follow.user, follows: follow.follows}, function(err, found){
                if(err) throw err;

                if(!found){
                    follow.save(function (err) {
                        if (err) { //handles errors
                            var error={};
                            console.log("error: " + err);

                            if (err.errors) {
                                error.errors = [];
                                if (err.errors.user) error.errors.push(err.errors.user.message);
                                if (err.errors.follows) error.errors.push(err.errors.follows.message);
                                res.status(403);
                                res.send(error.errors);
                            }
                        }

                        else { //if no errors, user is saved
                            User.update({_id: req.user._id}, {$inc: {followers: 1}}, function(){
                                User.update({_id: req.decoded._id}, {$inc: {following: 1}}, function(){
                                    res.json({
                                        success: true,
                                        message: "User followed"
                                    });
                                });
                            });
                        }
                    });
                }
                else{
                    res.json({success: false, message: 'Already following user'});
                }
            });
        })

        //unfollow a user
        .delete(function(req, res){
            Follow.findOne({user: req.decoded._id, follows: req.user._id}, function(err, found){
                if(err) throw err;

                if(found) {
                    Follow.remove({user: req.decoded._id, follows: req.user._id}, function (err) {//Add code to handle err
                        User.update({_id: req.user._id}, {$inc: {followers: -1}}, function () {
                            User.update({_id: req.decoded._id}, {$inc: {following: -1}}, function () {
                                res.json({
                                    success: true,
                                    message: "User Unfollowed"
                                });
                            });
                        });
                    });
                }

                else{
                    res.json({success: false, message: 'You are not following this user'});
                }
            });
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