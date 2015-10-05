var jwt = require('jsonwebtoken'); //JSON web token for authentication
var config = require('../../../config'), //Configuration
    secret = config.secret; //secret for token

module.exports = function(express) {
    var tokenRouter = express.Router();

    tokenRouter.use(function (req, res, next) {
        //check header, url or post parameters for token
        var token = req.headers['x-access-token'] || req.query.token || req.body.token;

        //decode token
        if (token) {
            //verifies secret and checks exp
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    //console.log(err);
                    res.status(403);
                    res.json({
                        success: false,
                        message: 'failed to authenticate token'
                    })
                }

                else {
                    req.decoded = decoded;
                    next();
                }
            })
        }

        else {
            res.json({
                success: false,
                message: 'no token provided'
            });
        }
    });

    return tokenRouter;
};