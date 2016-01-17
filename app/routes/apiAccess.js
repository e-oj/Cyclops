//private variables
var jwt = require('jsonwebtoken'); //JSON web token for authentication
var config = require('../../config'), //Configuration
    secret = config.secret; //secret for token
var bCrypt = require('bcrypt-nodejs'); //bcrypt for validating hashed passwords
var TOKEN_LIFESPAN = 1440;

/**
 * This module contains the routes for access to the
 * API (login and sign up routes). It validates users
 * And gives them a token on login that validates them
 * till the token expires or is removed from the client.
 *
 * @param express ------express
 * @param User ---------User model
 * @param mediaSuite ---mediaSuite
 * @param multer -------multer to save image to fs
 * @returns accessRouter
 */
module.exports = function(express, User, multer, mediaSuite){
    var accessRouter = express.Router();
    var error = {};//error object to store validation errors

    //saves media in a buffer
    accessRouter.use(multer({
        putSingleFilesInArray: true
        ,inMemory: true
    }));

    //saves profileMedia if any
    accessRouter.use('/register', mediaSuite.saveMedia);

    accessRouter.post('/register', function(req, res){
        var user = new User(); //create new user

        //get information from request body
        user.email = req.body.email;
        user.username = req.body.username;
        user.password = req.body.password;

        if(req.mediaIds.length){
            user.profileMedia = req.mediaIds[0];
        }

        user.save(function(err){
            if(err){ //handles errors
                console.log("error: " + err);
                if(err.errors) {
                    error.errors = [];
                    if (err.errors.email) error.errors.push(err.errors.email.message);
                    if (err.errors.username) error.errors.push(err.errors.username.message);
                    if (err.errors.password) error.errors.push(err.errors.password.message);
                    res.send(error.errors);
                }
            }

            else { //if no errors, user is saved
                res.status(201);

                res.json({
                    success: true
                    , message: "User created"
                });
            }
        });
    });

    accessRouter.post('/login', function(req, res){
        //make sure the username and password exist.
        if(!(req.body.username&&req.body.password)){
            res.status(403);

            res.json({
                success: false
                , message: 'Username and Password are required'
            });
        }
        else { //if the credentials exist, find user and validate password
            User.findOne({username: req.body.username}, 'username password', function(err, user){
                if (err) throw err;

                if (!user) {//user does not exist
                    res.status(403);

                    res.json({
                        success: false
                        , message: 'Authentication failed. Wrong username or password'
                    });

                }

                else {//validate the password
                    bCrypt.compare(req.body.password, user.password, function(err, match){
                        if(err) throw err;

                        if(match){ //if it matches the stored password
                            //assign a token
                            var repUser = {_id: user._id, username: user.username};

                            var token = jwt.sign(repUser, secret, {expiresInMinutes: TOKEN_LIFESPAN});
                            res.status(202);

                            res.json({
                                success: true
                                , message: user.username + ' successfully logged in'
                                , token: token
                            });
                        }

                        else{//wrong password
                            res.status(403);

                            res.json({
                                success: false
                                , message: 'Authentication failed. Wrong username or Password'
                            });
                        }
                    });
                }
            });
        }
    });

    return accessRouter;
};