var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var likeSchema = new Schema({
    post: {type: ObjectId, ref: "Post", required: true}
    , likedBy: {type: ObjectId, ref: "User", required: true}
});

var likeModel = mongoose.model("Likes", likeSchema);

module.exports = likeModel;