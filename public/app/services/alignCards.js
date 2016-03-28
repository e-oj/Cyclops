/**
 * @author EmmanuelOlaojo
 * @since 3/24/16
 */

angular.module("AlignCards", [])
  .factory("alignCards", function(){
    var align = {};
    var cards = document.getElementsByClassName("card");
    // var cards = angular.element(".card");
    var colCount = 0;
    var colWidth = 400;
    var margin = 20;
    var top = 20;
    var containerWidth = 0;

    align.loadCards = function(){
      var cardList = [];
      cards = angular.element(".card");

      colWidth = cards.width();

      containerWidth = angular.element("#cards").width();
      colCount = Math.floor(containerWidth / (colWidth + margin + margin));
      var newMargin = (containerWidth - (colCount * colWidth))/(colCount+1);
      var newTop = 0.6 * margin;

      margin = margin < newMargin ? newMargin : margin;
      top = top < newTop ? newTop : top;

      for(var i = 0; i < colCount; i++){
        cardList.push({height: 0, top: top, index: i});
      }

      positionCards(cardList);
    };

    align.reset = function(){
      margin = 20;
      top = 20;
    };

    function positionCards(cardList){
      cards.each(function(){
        var min = getMin(cardList);
        var index = min.index;
        var leftPos = margin + (index * (colWidth + margin));
        var self = angular.element(this);

        self.css({
          left: leftPos + "px"
          , top: min.height + min.top + "px"
        });

        //support for previous versions of the cards.
        if(self.hasClass("non-dir")){
          var height = self.height();
          var checkHeight = setInterval(function(){
            if(self.height() !== height){
              console.log("rearranging");
              height = self.height();
              align.reset();
              align.loadCards();
            }
          }, 1000);

          setTimeout(function(){
            clearInterval(checkHeight);
            console.log("cleared", checkHeight);
          }, 600000);
        }

        cardList[index] = {
          height: min.height + min.top + self.outerHeight()
          , top: min.top
          , index: min.index
        }
      });
    }

    /**
     * This function returns the column object with the
     * smallest height.
     *
     * @param arr an array of column objects
     *
     * @returns the column with the smallest height
     */
    function getMin(arr){
      var min;

      for(var i=0; i<arr.length; i++){
        if(min === undefined || arr[i].height < min.height ){
          min = arr[i];
        }
      }

      return min;
    }

    return align;
  });