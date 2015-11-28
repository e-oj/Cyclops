var colCount = 0;
var colWidth= 0;
var margin = 15;
var containerWidth = 0;
colIndex = 0;

function loadCards(delay){
    var cards = [];
    var leftCol = $('.left-col').outerWidth();
    var cardsWidth = $(window).outerWidth() - leftCol;
    var cardStyle = $('.card');

    $('#cards').css({
        'width': cardsWidth,
        'left': leftCol
    });

    cardStyle.css({
        'transition': delay? 'all 0.8s ease-in-out' : 'none'
    });

    containerWidth = cardsWidth;
    colWidth = cardStyle.outerWidth();
    colCount = Math.floor(containerWidth / (colWidth + margin));

    for (var i = 0; i < colCount; i++) {
        cards.push({height: margin, top: margin, index: i});
    }

    positionCards(cards);
}

function positionCards(cards){
    $('.card').each(function(){
        //alert('here');
        var min = getMin(cards);
        //var min = cards[colIndex];
        //alert('{ height: ' +min.height + ', top: ' + min.top + ', index :' + min.index + '}');
        var index = min.index;
        //var index = colIndex;
        var leftPos = margin+ (index*(colWidth+margin));

        $(this).css({
            'left': leftPos + 'px',
            'top': min.height + min.top +'px'
            //,'background': 'green'
        });

        //min.top = 15;
        cards[index] = {
            height: min.height +  min.top + $(this).outerHeight()
            , top: min.top
            , index: min.index
        };

        //colIndex++;
        //if(colIndex === 4) colIndex = 0;
    });
}

//function to get the min value in array
function getMin(arr){
    var min = arr[1];

    for(var i=0; i<arr.length; i++){
        if(arr[i].height < min.height ){
            min = arr[i];
        }
    }

    return min;
}

//setTimeout(function(){
//    loadCards();
//}, 1000);

$(window).resize(function(){
    setTimeout(function(){
        loadCards(true);
    }, 50);
});
