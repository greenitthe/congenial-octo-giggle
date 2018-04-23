$(document).ready(function() {
    function checkLoad() {
        var prevPage = Cookies.get('page');
        if (prevPage) {
            changeScreen(prevPage);
            $("#navbar li").removeClass("active")
            $("#" + prevPage).toggleClass("active")
        }
        else {
            changeScreen('home');
        }
    }
    $("#navbar").on("click", "li", function(e) {
        //Create a target variable for less querying
        $target = $(e.target)
        e.preventDefault();
        //If you are already on the right page, then don't bother
        if ($target.hasClass("active")) {
          return;
        } else {
          //If you aren't, set this as the active page, change screen
          $("#navbar li").removeClass("active")
          $target.toggleClass("active")
          changeScreen(e.target.id);
        }
    });
    function changeScreen(targetID) {
        console.log(targetID);
        Cookies.set('page', targetID);
        $("#content").load("includes/" + targetID + ".html");
    }
    var socket = io.connect('http://brct.io:8080');
    socket.on('connect', function(data) {
        socket.emit('join', 'Hello world from client');
    });
    socket.on('messages', function(data) {
        console.log(data);
    });
    function init() {
        checkLoad();
    }
    init();
});
