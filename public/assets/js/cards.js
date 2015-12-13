var colCount = 0;
var colWidth= 0;
var margin = 10;
var containerWidth = 0;

/**
 * This function sets the default values for the dimensions
 * of some of the UI components. It keeps the site looking
 * roughly the same across all screen sizes/resolutions.
 */
function setDefaults(){
    var leftCol = $('.left-col');
    var card = $('.card');
    var profileMedia = $(".info").find(".profile-media");
    var totalWidth = window.screen.availWidth;
    var leftWidth = totalWidth * 0.20;
    var profMediaDim = leftWidth * 0.52;

    //sets the width of the left column
    leftCol.css({
        'width': leftWidth
    });

    var cardsWidth = totalWidth - leftCol.width();
    var cardWidth = ((cardsWidth-(margin*5))/5);

    //sets the width of each card
    card.css({
        "width": cardWidth
    });

    //sets the profile media width
    profileMedia.css({
       "width":  profMediaDim
        , "height": profMediaDim
    });
}

/**
 * This function determines the maximum number of columns(n)
 * that can fit in the window at it's current size then
 * it creates an array with n "column" objects in it. Each
 * one of those objects contain the height of the column it
 * represents, that column's distance from the top, and the index
 * of the column. The array is then passed to positionCards
 */
function loadCards(){
    var card = $('.card');

    if(card.width() == 0) setDefaults();

    var cards = [];
    var leftCol = $('.left-col').width();
    var cardsWidth = $(window).width() - leftCol;

    $('#cards').css({
        'width': cardsWidth,
        'left': leftCol
    });

    containerWidth = cardsWidth;
    colWidth = card.width();
    colCount = Math.floor(containerWidth/(colWidth + margin));

    for(var i=0; i<colCount; i++){
        cards.push({height: margin, top: margin, index: i});
    }

    positionCards(cards);
}

/**
 * This function takes in a list of columns and for each
 * next element in the DOM with the card class, it adds that
 * element to the column with the smallest height i.e it positions
 * that card based on the information stored in the column object
 * with the shortest height.
 *
 * @param cards a list of objects containing information about a column
 */
function positionCards(cards){
    $('.card').each(function(){
        var min = getMin(cards);
        var index = min.index;
        var leftPos = margin+ (index*(colWidth+margin));

        $(this).css({
            'left': leftPos + 'px',
            'top': min.height + min.top +'px'
        });

        cards[index] = {
            height: min.height +  min.top + $(this).outerHeight()
            , top: min.top
            , index: min.index
        };
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

setTimeout(function(){
    loadCards();
}, 1000);

$(window).resize(function(){
    setTimeout(function(){
        loadCards();
    }, 50);
});
