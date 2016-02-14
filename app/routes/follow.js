/**
 * This module handles information regarding
 * a user's followers and the people they are
 * following.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * @param Follow -------Follow Model
 * @param User ---------User Model
 * @param tkRouter -----Token router
 * @param valUser ------Find&Save User to req
 * ============================================
 * @returns followRouter
 */

module.exports = function(express, mongoose, User, Follow, tkRouter, valUser){
    var followRouter = express.Router();

    followRouter.use(tkRouter);

    //get all the users the person is following
    followRouter.get('/following', function(req, res){
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
    followRouter.get('/followers', function(req, res){
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

    /**
     * Validate the :user parameter, find the user with that id
     * if it exists and saves it to req.user
     */
    followRouter.param('user', valUser);

    //gets the users a person is following.
    followRouter.get('/:user/following', function(req, res){
        Follow.find({user: req.user._id})
            .populate('follows', 'username')
            .select('follows')
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

    //gets the people following a user.
    followRouter.get('/:user/followers', function(req, res){
        Follow.find({follows: req.user._id})
            .populate('user', 'username')
            .select('user')
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

    followRouter.route('/follow/:user')
        //follow a user
        .post(function(req, res){

            if(req.decoded._id == req.user._id){
                res.status(406);
                res.json({
                    success: false
                    , message: "Can't follow self"
                });
            }
            else{
                var follow = new Follow();

                //get information from request body
                follow.user = req.decoded._id;
                follow.follows = req.user._id;

                Follow.findOne({user: follow.user, follows: follow.follows}, function (err, found) {
                    if (err) throw err;

                    if (!found) {
                        follow.save(function (err) {
                            if (err) { //handles errors
                                var error = {};
                                console.log("error: " + err);

                                if (err.errors) {
                                    error.errors = [];
                                    if (err.errors.user) error.errors.push(err.errors.user.message);
                                    if (err.errors.follows) error.errors.push(err.errors.follows.message);
                                    res.send(error.errors);
                                }
                            }

                            else { //if no errors, user is saved
                                User.update({_id: req.user._id}, {$inc: {followers: 1}}, function () {
                                    User.update({_id: req.decoded._id}, {$inc: {following: 1}}, function () {
                                        res.json({
                                            success: true,
                                            message: "User followed"
                                        });
                                    });
                                });
                            }
                        });
                    }
                    else {
                        res.json({success: false, message: 'Already following user'});
                    }
                });
            }
        })

        //unfollow a user
        .delete(function(req, res){
            Follow.findOne({user: req.decoded._id, follows: req.user._id}, function(err, found){
                if(err) throw err;

                if(found) {
                    Follow.remove({user: req.decoded._id, follows: req.user._id}, function (err) {
                        if(!err) {
                            User.update({_id: req.user._id}, {$inc: {followers: -1}}, function () {
                                User.update({_id: req.decoded._id}, {$inc: {following: -1}}, function () {
                                    res.json({
                                        success: true,
                                        message: "User Unfollowed"
                                    });
                                });
                            });
                        }
                    });
                }

                else{
                    res.json({success: false, message: 'You are not following this user'});
                }
            });
        });

    return followRouter;
};