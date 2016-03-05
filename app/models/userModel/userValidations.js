/**
 * This module validates the User model to
 * ensure that values for all the required
 * fields are supplied in the right format
 */

var validator = require('validator'); //library with preset validation functions

validator.extend('noWhitespace', function(str){
    //checks if there are no whitespaces in str
    return str.indexOf(' ') == -1;
});

validator.extend('validPassword', function(str){
    //Checks that there is an uppercase letter, a
    //lowercase letter and a number in str
    var upper = false;
    var lower = false;
    var num = false;

    for(var i = 0; i < str.length; i++){
        if(!isNaN(str[i])) num = true;//if it's a number
        else if(str[i] == str[i].toUpperCase()) upper = true;//if it's uppercase
        else if(str[i]== str[i].toLowerCase()) lower = true;//if it's lowercase
    }

    return upper && lower && num;
});

/**
 * This is where the heavy lifting is done after
 * the groundwork is laid with the above functions
 *
 * @param User - User to be operated on
 * @returns the User with all the validations applied
 */
module.exports = function(User){
    //Validation for the email field
    User.schema.path('email')
        //make sure no other user has that email
        .validate(function (value, respond) {
            if(!this.isModified('email')) respond(true);
            else {
                User.findOne({email: value}, function (err, user) {
                    if (user) respond(false);
                    else
                        respond(true)
                });
            }
        }, 'This email address is already registered')

        //checks that the value is an email
        .validate(function(value){
            if(!this.isModified('email')) return true;
            else
                return validator.isEmail(value);
        }, 'Invalid email');

    //Validation for the username field
    User.schema.path('username')

        //check for special characters in the username
        .validate(function(value){
            if(!this.isModified('username')) return true;
            else
                return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value);
        }, 'Username cannot contain special characters')

        //checks for whitespace in username
        .validate(function(value){
            if(!this.isModified('username')) return true;
            else
                return (validator.noWhitespace(value));
        }, 'Username cannot contain whitespaces')

        //check that username is the appropriate length
        .validate(function(value){
            if(!this.isModified('username')) return true;
            else
                return validator.isLength(value, 3, 20);
        }, 'Username must between 3 and 20 characters long')

        //check's that no other user has username
        .validate(function (value, respond) {
            if(!this.isModified('username')) respond(true);
            else {
                User.findOne({username: value}, function (err, user) {
                    if (user) respond(false);
                    else
                        respond(true);
                });
            }
        }, 'This username is already in use');

    //Validation for the password field
    User.schema.path('password')

        //checks that password is at least 6 characters long.
        .validate(function(value){
            if(!this.isModified('password')) return true;
            else
                return validator.isLength(value, 6);
        }, 'password must at least 6 characters long')

        //checks that password has no whitespace
        .validate(function(value){
            if(!this.isModified('password')) return true;
            else
                return (validator.noWhitespace(value));
        }, 'Password cannot contain whitespaces')

        //checks that password has no whitespace
        .validate(function(value){//checks that password has no special characters
            if(!this.isModified('password')) return true;
            else
                return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value);
        }, 'Password cannot contain special characters')

        //checks that password has no whitespace
        .validate(function(value){
            //checks that the password has at least one uppercase letter,
            //one lowercase letter and one number.
            if(!this.isModified('password')) return true;
            else
                return validator.validPassword(value);
        }, 'Password must contain at least one uppercase letter, one lower' +
            'case letter and one number');

    User.schema.path('profileMsg')
        //checks that profile message is at least 6 characters long.
        .validate(function(value){
            if(!this.isModified('profileMsg')) return true;
            else
                return validator.isLength(value, 0, 200);
        }, 'Profile message cannot exceed 200 characters');


    return User;
};