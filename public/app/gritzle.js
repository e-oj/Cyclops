angular.module("Gritzle", ["Home", "AudioPlayer", "PostCard", "ui.router"])
  .config(["$stateProvider"
    , "$urlRouterProvider"
    , function($stateProvider, $urlRouterProvider){
      $urlRouterProvider.otherwise("/");

      $stateProvider.state("home", {
        url: "/"
        , templateUrl: "/app/views/templates/home.html"
      });
    }
  ])

  .controller("gritzle", [function(){
    var FONT_RATIO = 0.01041667;

    angular.element("body").css({
      fontSize: window.screen.availWidth * FONT_RATIO + "px"
    });
  }]);