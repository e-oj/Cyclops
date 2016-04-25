angular.module('Access', ['authService', 'Validator'])
    .controller('accessController', ['$scope', 'Auth', 'validator', function($scope, Auth, validator){
        var self = this;

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
