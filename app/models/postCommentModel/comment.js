/**
 * This module dictates the structure of the
 * Comments model. Mongoose is used as the mongoDB
 * framework.
 */

//=============================================================
//Dependencies
//=============================================================
var mongoose = require('mongoose'); //for database interactions
var Schema = mongoose.Schema; //to define structure

var commentSchema = new Schema({
    post: {type: Schema.ObjectId, required: true},
    author: {type: Schema.ObjectId, required: true, ref: 'User'},
    title: String,
    body:{type: String, required: true},
    date: Date,
    meta: {
        likes: {type: Number, default: 0},
        dislikes: {type: Number, default: 0}
    }
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;