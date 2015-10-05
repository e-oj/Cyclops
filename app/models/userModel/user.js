/**
 * This module dictates the structure of the
 * User model. Mongoose is used as the mongoDB
 * framework.
 */

//=============================================================
//Dependencies
//=============================================================
var mongoose = require('mongoose'); //for database interactions
var Schema = mongoose.Schema; //to define structure
var bCrypt = require('bcrypt-nodejs'); //to hash passwords before they are saved

var userSchema = new Schema({//Schema for User model
    //declaration of fields and their restrictions.
    email: {type: String, required: true, lowercase:true},
    username: {type: String, required: true, index:{unique: true}},
    password: {type: String, required: true, select: false}
    , profileMedia: {
        media: {type: Schema.ObjectId},
        mediaType: String
    }
    , profileMsg: String
    , following: {type:Number, default: 0}
    , followers: {type:Number, default: 0}
    , reputation: {type:Number, default: 0}
});

userSchema.pre('save', function(next){
    var user = this;

    //hash the password only if the password has been changed or the user is new
    if(!user.isModified('password')) return next();

    //generate the hash
    bCrypt.hash(user.password, null, null, function(err, hash){
        if(err) return next(err);

        //change the password to the hashed version
        user.password = hash;
        next();
    });
});

//pass the user through the validation module to set validation rules
User = require('./userValidations')(mongoose.model('User', userSchema));
module.exports = User;
