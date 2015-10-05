var mongoose = require('mongoose');

module.exports = function (req, res, next, user) {
    if (mongoose.Types.ObjectId.isValid(user)) {//checks if user is valid id
        //if it is, find the user and save it to req.user
        User.findById(user, function (err, found) {
            if (err || !found) {
                res.json({success: false, result: 'User not found'});
            }

            else {
                req.user = found;
                next();
            }
        });
    }

    else {//if the ID is invalid, treat it as a username
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