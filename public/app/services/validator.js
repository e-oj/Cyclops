/**
 * @author EmmanuelOlaojo
 * @since 4/25/16
 */

angular.module("Validator", [])
  .factory("validator", [function(){
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

    return validator;
  }]);
