/**
 * This module verifies the existence of a user.
 *
 * it takes in a parameter called user which could
 * be a user ID or a username. If the parameter is a
 * valid ObjectID, we search our database for the ID
 * else we treat it as a username and check for a user
 * with that username.
 *
 * TODO: restrict users from creating usernames with ObjectID length.
 *
 * @type {*|exports|module.exports}
 */

var mongoose = require('mongoose');
var User = require('../../models/userModel/user');

module.exports = function (req, res, next, user) {
    //checks if user is valid id
    if (mongoose.Types.ObjectId.isValid(user)) {
        //if it is, find the user and save it to req.user
        User.findById(user, function (err, found) {
            if (err || !found) {
                if(err) throw err;

                res.json({success: false, result: 'User not found'});
            }

            else {
                req.user = found;
                next();
            }
        });
    }

    //if the ID is invalid, treat it as a username
    else {
        //find the user with the username and save it to req.user
        console.log('checking for username ' + user);
        User.findOne({username: user}, function (err, found) {
            if (err || !found) {
                res.json({success: false, result: 'User not found'});
            }

            else {
                req.user = found;
                next();
            }
        });
    }
};