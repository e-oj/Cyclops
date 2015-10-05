/**
 * This module is responsible for handling comments
 * it allows the client to store comments in the database,
 * update comments, get comments from the database, and
 * delete comments.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * @param Post ---------Post Model
 * @param Comment ------Comment Model
 * @param User ---------User Model
 * @param tkRouter -----Token router
 * @param valUser ------Find&Save User to req
 * ============================================
 * @returns commentsRouter
 */

module.exports = function(express, mongoose, Post, User, Comment, tkRouter, valUser){
    var commentsRouter = express.Router();

    commentsRouter.use(tkRouter);
    /**
     * Gets every single comment. Really. All of them.
     * Every last one. Now why would we need this? I don't
     * know yet but I'll update this comment when i find out.
     */
    commentsRouter.get('/', function(req, res){
        Comment.find({}).populate('author', 'username')
            .exec(function(err, comments){
                if(err){
                    res.json({
                        error: err.message,
                        success: false,
                        result: 'Comments not found'
                    });
                }

                else{
                    res.json({
                        success: true,
                        result: comments
                    });
                }
            });
    });

    /**
     * Validate the postID parameter, find the post with that id
     * if it exists and saves it to req.found. I might remove this
     * middleware later if it raises performance issues as it might
     * be unnecessary.
     */
    commentsRouter.param('postID', function (req, res, next, post) {
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

    //Gets all the comments for the post with id :postID
    commentsRouter.get('/post/:postID', function (req, res) {
        Comment.find({post: req.found._id}).populate('author', 'username')
            .exec(function (err, comments) {
                if (err || !comments) {
                    res.json({success: false, result: 'comment not found'})
                }

                else {
                    res.json({
                        success: true,
                        result: comments
                    });
                }
            });
    });

    /**
     * validate the user parameter by checking if it's a valid
     * username or password. If it is, save the user to the
     * request for use throughout the router.
     */
    commentsRouter.param('user', valUser);

    //Gets all the comments for :user
    commentsRouter.get('/user/:user', function (req, res) {
        Comment.find({author: req.user._id}).populate('author', 'username')
            .exec(function (err, comments) {
                if (err || !comments) {
                    res.json({success: false, result: 'Comment not found'})
                }

                else {
                    res.json({
                        success: true,
                        result: comments
                    });
                }
            });
    });

    /**
     * Validate the commentID parameter, find the comment with that id
     * if it exists and saves it to req.comment
     */
    commentsRouter.param('commentID', function (req, res, next, commentID) {
        Comment.findById(commentID).populate('author', 'username')
            .exec(function (err, found) {
                if (err || !found) {
                    res.json({success: false, result: 'Post not found'});
                }

                else {
                    req.comment = found;
                    next();
                }
            });
    });

    /**
     * This route allows us to get, update or delete
     * a comment with id:commentID made by :user on
     * a post with id:postID
     */
    commentsRouter.route('/:commentID')
        //get the comment
        .get(function (req, res) {
            res.json({
                success: true,
                result: req.comment
            })
        })

        //update the comment
        .put(function (req, res) {
            //boolean to determine if there's info to update user with
            var info = false;

            if (req.body.title) {//if there's a new value for comment title
                req.comment.title = req.body.title;
                info = true;
            }
            if (req.body.body) {//if there's a new value for comment body
                req.comment.body = req.body.body;
                info = true;
            }

            if (req.body.likes) {//if there's a new value for comment likes
                req.comment.meta.likes = req.body.likes;
                info = true;
            }

            if (req.body.dislikes) {//if there's a new value for comment dislikes
                req.comment.meta.dislikes = req.body.dislikes;
                info = true;
            }

            if (info) {//if there's new information
                req.comment.save(function (err) {//save the comment
                    if (err) {
                        res.json({success: false, error: err.message, message: 'Comment could not be updated'});
                    }

                    else {
                        res.json({success: true, message: 'Comment Updated'});
                    }
                });
            }

            else {
                res.json({success: false, message: "Update values were not found"});
            }
        })

        //delete the comment
        .delete(function (req, res) {
            req.comment.remove(function (err) {
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
                        message: 'Comment Deleted'
                    })
                }
            });
        });

    return commentsRouter;
};
