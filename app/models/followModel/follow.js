/**
 * This module dictates the structure of the
 * follow model.
 *
 */

var mongoose =  require('mongoose'),
    Schema = mongoose.Schema;

/**
 * The followSchema is basically an object that contains
 * a user and one other user that they follow
 */
var followSchema = new Schema({
    user: {type: Schema.ObjectId, required: true, ref: 'User'},
    follows: {type: Schema.ObjectId, required: true, ref: 'User'}
});

// Box up and ship (export) the follow model
var followModel = mongoose.model('followModel', followSchema);

module.exports = followModel;