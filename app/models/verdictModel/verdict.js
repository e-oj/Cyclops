var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var verdictSchema = new Schema({
    post: {type: ObjectId, ref: "Post", required: true}
    , judge: {type: ObjectId, ref: "User", required: true}
    , bump: {type: Boolean, default: false}
    , dump: {type: Boolean, default: false}
});

var verdictModel = mongoose.model("Verdict", verdictSchema);

module.exports = verdictModel;