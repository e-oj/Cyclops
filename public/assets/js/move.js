function move(elem){
    //alert('in');
    var container = $(elem).parent().closest('div');
    var elemWidth = 0;
    var containerWidth = container.width();

    $(elem).children().each(function(){
        elemWidth += $(this).width();
    });

    var movable = elemWidth > (containerWidth * 0.9);
    if(movable){
        var distance = elemWidth - containerWidth;

        $(elem).css({
            'transition': 'all 2s ease-in-out'
            , 'position': 'relative'
            , 'left': -distance - 20 + 'px'
            , 'padding': "5px 0px 5px 0px"
        });

        $(elem).mouseleave(function(){
            setTimeout(function(){
                $(elem).css({
                    'left': 0
                })
            }, 1000);
        })
    }
}

//function