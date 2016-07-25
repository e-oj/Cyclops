/**
 * This module checks an incoming request for a token
 * decodes that token to get the user info stored in it.
 *
 * A 403 response is sent back for invalid tokens.
 *
 * If a token is successfully decoded, the information it
 * contains is stored in the decoded field of the request
 * object, req.decoded, for use in other middleware or routes
 *
 * @type {exports|module.exports}
 */

var jwt = require('jsonwebtoken'); //JSON web token for authentication
var config = require('../../../config'), //Configuration
  secret = config.secret; //secret for token

module.exports = function(express) {
  var tokenRouter = express.Router();

  tokenRouter.use(function (req, res, next) {
    //check header, url or post parameters for token
    var token = req.body.token || req.headers['x-access-token'];

    //decode token
    if (token) {
      token = token.toString();
      //verifies secret and checks exp
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          console.log(err);
          res.status(403);
          res.json({
            success: false,
            message: "You're not logged in"
          })
        }

        else {
          req.decoded = decoded;
          next();
        }
      })
    }

    else {
      // console.log("GET OUTT!!!");
      res.json({
        success: false,
        message: "You're not logged in"
      });
    }
  });

  return tokenRouter;
};