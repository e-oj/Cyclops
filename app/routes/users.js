/**
 * This module contains the user router and handles
 * requests to /user. It allows Users to us to get
 * users from the database, update, and/or delete
 * them.
 *
 * ============================================
 * DEPENDENCY INJECTIONS
 * ============================================
 * @param express ------ExpressJS
 * @param mongoose -----MongooseJS
 * @param User ---------User Model
 * @param Follow -------Follow Model
 * @param Post ---------Post Model
 * @param tkRouter -----Token Router
 * @param valUser ------valUser Router
 * ============================================
 * @returns userRouter
 */

module.exports = function(express, mongoose, User, Follow, Post, tkRouter, valUser) {

    //initialize userRouter
    var userRouter = express.Router();

    userRouter.use(tkRouter);

    //get all users
    userRouter.get('/', function (req, res) {
        //res.json('Welcome to teh api');
        User.find(function (err, users) {
            if (err) res.send(err);

            res.send(users);
        });
    });

    //delete all users
    userRouter.delete('/', function (req, res) {
        User.remove({}, function (err) {
            if (err) throw err;

            else res.json({message: 'All users deleted'});
        });
    });

    /**
     * validate the user parameter by checking if it's a valid
     * username or password. If it is, save the user to the
     * request for use throughout the router.
     */
    userRouter.param('user', valUser);

    //allows us to get a user
    userRouter.route('/:user')
        //get the user identified by :user
        .get(function (req, res) {
            //find and return the user wth :userID
            res.json({
                success: true,
                result: req.user
            });
        });

    return userRouter;
};

