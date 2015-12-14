function toggle(element){
    var webStuff = document.getElementById("web-stuff");
    var computingStuff = document.getElementById("computing-stuff");
    document.getElementById(element.id).style.fontWeight = "bold";

    if(element.id == "web"){
        show(webStuff);
        hide(computingStuff);
        document.getElementById("computing").style.fontWeight = "normal";
    }
    else{
        show(computingStuff);
        hide(webStuff);
        document.getElementById("web").style.fontWeight = "normal";
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

