$(document).ready(function() {
  $(".area").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    console.log(clickedButton);
    socket.emit('incrementClicked', {
      player: "Name",
      name: clickedButton
    })
  })

  function checkLoad() {
    var prevPage = Cookies.get('pageIndex');
    if (prevPage) {
      //changeScreen(prevPage);
      $("#navbar li").removeClass("active");
      $("#" + prevPage).toggleClass("active");
    }
    else {
      //changeScreen('home');
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
      var activePage = $('#navbar').find('.active');
      activePage.removeClass('active')
      $target.addClass('active')

      if (activePage.index() > $target.index()) {
        handleScreenSwap(activePage.index(), $target.index(), true); //active is left, so new is right
      }
      else {
        handleScreenSwap(activePage.index(), $target.index(), false); //active is right, so new is left
      }
      //saveScreen(e.target.id);
    }
  });

  function handleScreenSwap(curPageIndex, nextPageIndex, isRight) {
    $('#' + $('#navbar li')[nextPageIndex].id + 'Page').show();
    if (isRight == false) {
      for (var i = curPageIndex; i < nextPageIndex; i++) {
        console.log(curPageIndex + " | " + i + " | " + nextPageIndex);
        console.log($('#navbar li').eq(i).attr('class'));
        $('#' + $('#navbar li')[i].id + 'Page').removeClass('centerPage rightPage leftPage');
        $('#' + $('#navbar li')[i].id + 'Page').addClass('leftPage');
      }
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').removeClass('centerPage rightPage leftPage');
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').addClass('centerPage');
    }
    else {
      for (var i = curPageIndex; i > nextPageIndex; i--) {
        console.log(curPageIndex + " | " + i + " | " + nextPageIndex);
        $('#' + $('#navbar li')[i].id + 'Page').removeClass('centerPage rightPage leftPage');
        $('#' + $('#navbar li')[i].id + 'Page').addClass('rightPage');
      }
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').removeClass('centerPage rightPage leftPage');
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').addClass('centerPage');
    }
    window.setTimeout("$('#' + $('#navbar li')[ " + curPageIndex + "].id + 'Page').hide(); $('#' + $('#navbar li')[" + nextPageIndex + "].id + 'Page').show()", 600);
    console.log("-----------------------");
    $('#navbar li').each(function() {
      console.log($(this).text() + ":" + $('#' + this.id + 'Page').attr("class"));
    });
  }

  function saveScreen(targetID) {
    console.log(targetID);
    $('#' + Cookies.get('page') + 'Page').addClass('left');
    Cookies.set('page', targetID);

    $('#' + targetID + 'Page').removeClass('left');

    if (targetID == "home") {
      $('#bio').show();
    }
    else {
      $('#bio').hide();
    }
  }
  var socket = io.connect('http://brct.io:8080');
  socket.on('connect', function(data) {
    socket.emit('join', 'Hello world from client');
  });
  socket.on('messages', function(data) {
    console.log(data);
  });
  socket.on('gameData', function(data) {
    console.log(data);
  });
  function init() {
    //checkLoad();
  }
  init();
});
