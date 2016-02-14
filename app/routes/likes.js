module.exports = function(Likes, tkRouter){
    var express = require("express");
    var likeRouter = express.Router();

    likeRouter.use(tkRouter);
};
