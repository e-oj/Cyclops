var colCount = 0;
var colWidth= 0;
var margin = 15;
var containerWidth = 0;
colIndex = 0;

function loadCards(){
    var cards = [];
    var leftCol = $('.left-col').width();
    cardsWidth = $(window).width() - leftCol;

    $('#cards').css({
        'width': cardsWidth,
        'left': leftCol
    });

    containerWidth = cardsWidth;
    colWidth = $('.card').width();
    colCount = Math.floor(containerWidth/(colWidth + margin));

    for(var i=0; i<colCount; i++){
        cards.push({height: margin, top: 15, index: i});
    }

    positionCards(cards);
}

function positionCards(cards){
    $('.card').each(function(){
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
    var min;

    for(var i=0; i<arr.length; i++){
        if(min === undefined || arr[i].height < min.height ){
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
        loadCards();
    }, 50);
});
