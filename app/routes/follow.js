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

    return followRouter;
};