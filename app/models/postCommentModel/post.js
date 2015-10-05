/**
 * This module dictates the structure of the
 * Post model. Mongoose is used as the mongoDB
 * framework.
 */

//=============================================================
//Dependencies
//=============================================================
var mongoose = require('mongoose'); //for database interactions
var Schema = mongoose.Schema; //to define structure

var postSchema = new Schema({
    author: {type: Schema.ObjectId, ref: 'User', required: true},
    title: String,
    body:{type: String, required: true},
    date: Date,
    tags: [String],
    captions: [String],
    files: [{
        media: {type: Schema.ObjectId},
        mediaType: String
    }],
    meta: {
        likes: {type: Number, default: 0}
        , dislikes: {type: Number, default: 0}
        , comments: {type: Number, default: 0}
        , shares: {type: Number, default: 0}
    }
});

var Post = mongoose.model('Post', postSchema);
module.exports = Post;