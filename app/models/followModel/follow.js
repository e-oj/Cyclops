/**
 * This module dictates the structure of the
 * follow model.
 */

//=============================================================
//Dependencies
//=============================================================
var mongoose =  require('mongoose'),
    Schema = mongoose.Schema;


var followSchema = new Schema({
    user: {type: Schema.ObjectId, required: true, ref: 'User'},
    follows: {type: Schema.ObjectId, required: true, ref: 'User'}
});

var followModel = mongoose.model('followModel', followSchema);

module.exports = followModel;