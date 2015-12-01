/**
 * The router in this module mounts all
 * the other routers on abstract paths to be
 * used in the server.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * ============================================
 * @returns apiRouter
 */

//models
var User = require('../models/userModel/user');
var Post = require('../models/postCommentModel/post');
var Comment =require('../models/postCommentModel/comment');
var Follow =require('../models/followModel/follow');

//libs
var grid = require('gridfs-stream');
var multer = require('multer');
var _ = require('underscore');
var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports = function(express, mongoose) {
    var apiRouter = express.Router();
    var tokenRouter = require('./middleware/valToken')(express);
    var conn = mongoose.connection;
    var valUser = require('./middleware/valUser'); //function that finds user by id or username
    //routers
    var userRouter = require('./users')(express, mongoose, User, Follow, Post, tokenRouter, valUser);
    var commentsRouter = require('./comments')(express, mongoose, Post, User, Comment, tokenRouter, valUser);
    var followRouter = require('./follow')(express, mongoose, User, Follow, tokenRouter, valUser);

    grid.mongo = mongoose.mongo;
    //initialize the routes that utilize GridFS once we connect to the database.
    conn.once('open', function () {
        var gfs = grid(conn.db);
        var mediaSuite = require('./middleware/mediaSuite')(gfs, eventEmitter);
        var pollSuite = require('./utils/pollSuite')(express, User, Post, _, gfs);
        var meRouter =
            require('./me')(Follow, User, Comment, Post, tokenRouter, valUser, mediaSuite, multer, pollSuite);
        var mediaRouter = require('./media')(express, mediaSuite, tokenRouter);
        var postRouter = require('./posts')(express, mongoose, Post, User, tokenRouter, valUser, gfs, _, pollSuite);
        var accessRouter = require('./apiAccess')(express, User, multer, mediaSuite);

        apiRouter.use('/access', accessRouter); //mounts the access router on /access
        apiRouter.use('/me', meRouter); //mounts the me router on /me
        apiRouter.use('/media', mediaRouter); //mounts the media router on /media
        apiRouter.use('/posts', postRouter); //mounts the posts router on /posts
    });

    apiRouter.use('/users', userRouter); //mounts the users router on /users
    apiRouter.use('/comments', commentsRouter); //mounts the comments router on /comments
    apiRouter.use('/relations', followRouter); //mounts the follow router on /follow

    return apiRouter;
};