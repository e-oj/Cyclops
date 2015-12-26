angular.module('Access', ['authService'])
    .controller('accessController', ['$scope', 'Auth', function($scope, Auth){
        var self = this;
        var validator = {};

        validator.hasSpace = function(value){
            return value.indexOf(' ') > -1;
        };

        validator.illegalChars = function(value){
            return /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value);
        };

        validator.isLength = function(value, min, max){
            if(max)
                return value.length >= min && value.length <= max;
            else
                return value.length >= min;
        };
        
        validator.validPassword = function(value){
            //Checks that there is an uppercase letter, a
            //lowercase letter and a number in value
            var upper = false;
            var lower = false;
            var num = false;

            for(var i = 0; i < value.length; i++){
                if(!isNaN(value[i])) num = true;//if it's a number
                else if(value[i] == value[i].toUpperCase()) upper = true;//if it's uppercase
                else if(value[i]== value[i].toLowerCase()) lower = true;//if it's lowercase
            }

            return upper&&lower&&num;
        };

        self.loggedIn = function(){
            return Auth.isLoggedIn();
        };

        self.reply = {
            message: null
            , failed: false
            , processing: false
        };

        self.credentials = {
            username: null
            , password: null
        };

        var setErrMsg = function(msg){
            if(msg) self.reply.message = msg;
            else self.reply.message = 'Invalid Username or Password';

            self.reply.processing = false;
        };

        self.logIn = function(){
            self.reply.processing = true;
            var username = self.credentials.username;
            var password = self.credentials.password;

            if(!Auth.isLoggedIn()) {
                if(username && password){
                    if (validator.hasSpace(username)
                        || validator.hasSpace(password)
                        || validator.illegalChars(username)
                        || validator.illegalChars(password)
                        || !validator.isLength(username, 3, 20)
                        || !validator.isLength(password, 6)
                        || !validator.validPassword(password)
                    ) {
                        setErrMsg();
                    }
                    else {
                        Auth.login(self.credentials, self.reply);
                    }
                }
                else setErrMsg();
            }
            else setErrMsg('Already logged in');
        }
    }]);
