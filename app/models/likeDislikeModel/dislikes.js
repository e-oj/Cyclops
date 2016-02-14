var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dislikeSchema = new Schema({
    post: {type: ObjectId, ref: "Post", required: true}
    , dislikedBy: {type: ObjectId, ref: "User", required: true}
});

var dislikeModel = mongoose.model("Likes", dislikeSchema);

module.exports = dislikeModel;