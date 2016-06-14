module.exports = function(Posts, Verdict, tkRouter){
  var express = require("express");
  var verdictRouter = express.Router();

  verdictRouter.use(tkRouter);
  
  verdictRouter.route("/verdict")
    .post(function(req, res){
      var postId = req.body.postId.toString();
      var gotBumped = req.body.bump;
      var judge = req.decoded._id;
      var bump = {bump: true};
      var dump = {dump: true};

      if(!postId || gotBumped == undefined || typeof gotBumped != "boolean"){
        res.status(400);

        return res.json({
          success: false
          , message: "@verdictRouter: Missing or incorrect Information"
        });
      }

      Verdict.findOne({post: postId, judge: judge}, function(err, verdict){
        if(err){
          return res.json({
            success: false
            , message: "@verdictRouter: Error finding Verdict"
          });
        }

        if(verdict){
          if((verdict.bump && gotBumped) || (verdict.dump && !gotBumped)){
            res.status(200);

            return res.json({
              success: true
              , message: "Unchanged verdict"
            });
          }

          verdict.update(gotBumped ? bump : dump, function(err){
            if(err){
              return res.json({
                success: false
                , message: "@verdictRouter: Error on verdict update"
              });
            }
            
            Posts.update({_id: postId}, {$inc: {likes: 1, dislikes: -1}}, function(err){
              if(err){
                return res.json({
                  success: false
                  , message: "@verdictRouter: Error on post update"
                });
              }

              res.json({
                success: true
                , message: "Verdict Saved"
              });
            });
          });
        }
        else{
          //create new verdict
        }
      });
    });
};
