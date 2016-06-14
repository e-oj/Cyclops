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

//TODO: Change dimension to dimensions
var postSchema = new Schema({
    author: {type: Schema.ObjectId, ref: 'User', required: true, index: true}
    , title: String
    , body:{type: String, required: true}
    , date: Date
    , tags: [String]
    , captions: [String]
    , files: [{
        media: {type: Schema.ObjectId}
        , mediaType: String
        , dimension: {
            width: Number
            , height: Number
        }
    }]
    , meta: {
        bumps: {type: Number, default: 0}
        , dumps: {type: Number, default: 0}
        , comments: {type: Number, default: 0}
        , shares: {type: Number, default: 0}
    }
});

// Box up and ship (export) the post model
var Post = mongoose.model('Post', postSchema);
module.exports = Post;
