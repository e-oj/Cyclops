function toggle(element){
    var item1Stuff = document.getElementById("item1-stuff");
    var item2Stuff = document.getElementById("item2-stuff");
    document.getElementById(element.id).style.fontWeight = "bold";

    if(element.id == "item1"){
        show(item1Stuff);
        hide(item2Stuff);
        document.getElementById("item2").style.fontWeight = "normal";       
    }
    else{
        show(item2Stuff);
        hide(item1Stuff);
        document.getElementById("item1").style.fontWeight = "normal";  
    }
}

function show(element){
    element.style.visibility = "visible";
}

function hide(element){
    element.style.visibility = "hidden";
}

function changeCursor(element){
    element.style.cursor = "pointer";
}

