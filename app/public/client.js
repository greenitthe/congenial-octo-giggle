$(document).ready(function() {
  function handleGameLogin() {
    var username = Cookies.get('username');
    var pin = Cookies.get('pin');
    if (username) {
      $('#username').hide();
      $('#gameArea').show();
      $('#userControls').show();
      $('#usernameInfo').text(username + "#" + pin);
      tryUpdate();
    }
    else {
      $('#gameArea').hide();
      $('#userControls').hide();
      $('#username').show();
      $('#usernameInfo').text('');
    }
  }

  $("#usernameInput").keyup(function() {
    $("#usernameInput").val(this.value.match(/[A-z]*/));
  });

  $("#pinInput").keyup(function() {
    $('#pinInput').val(this.value.match(/[0-9]*/));
  });

  $("#username").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    console.log(clickedButton);
    if (clickedButton == 'submit') {
      socket.emit('newUser', {
        username: $("#usernameInput").val(),
        pin: $("#pinInput").val()
      });
    }
  })
  $("#userControls").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    console.log(clickedButton);
    if (clickedButton == 'logout') {
      Cookies.set('username', '');
    }
    console.log("Logged out." + Cookies.get('username'));
    handleGameLogin();
  })

  $(".area").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    console.log(clickedButton);
    socket.emit('incrementalClicked', {
      username: Cookies.get('username'),
      pin: Cookies.get('pin'),
      type: clickedButton
    })
  })

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
      saveScreen(e.target.id);
    }
  });

  function handleScreenSwap(curPageIndex, nextPageIndex, isRight) {
    $('#' + $('#navbar li')[nextPageIndex].id + 'Page').show();
    if (isRight == false) {
      for (var i = curPageIndex; i < nextPageIndex; i++) {
        $('#' + $('#navbar li')[i].id + 'Page').removeClass('centerPage rightPage leftPage');
        $('#' + $('#navbar li')[i].id + 'Page').addClass('leftPage');
      }
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').removeClass('centerPage rightPage leftPage');
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').addClass('centerPage');
    }
    else {
      for (var i = curPageIndex; i > nextPageIndex; i--) {
        $('#' + $('#navbar li')[i].id + 'Page').removeClass('centerPage rightPage leftPage');
        $('#' + $('#navbar li')[i].id + 'Page').addClass('rightPage');
      }
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').removeClass('centerPage rightPage leftPage');
      $('#' + $('#navbar li')[nextPageIndex].id + 'Page').addClass('centerPage');
    }
    window.setTimeout("$('#' + $('#navbar li')[ " + curPageIndex + "].id + 'Page').hide(); $('#' + $('#navbar li')[" + nextPageIndex + "].id + 'Page').show()", 600);
  }

  function saveScreen(targetID) {
    console.log(targetID);
    Cookies.set('page', targetID);
  }

  function checkPageParameter() {
    var pageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = pageURL.split('&'),
        parameterName,
        i;
    for (i=0; i < URLVariables.length; i++) {
      parameterName = URLVariables[i].split('=');

      if (parameterName[0] === "page" && parameterName[1] !== undefined) {
        var IDs = [];
        $("#navbar").find("li").each(function() { IDs.push(this.id); });
        if ($.inArray(parameterName[1], IDs) >= 0) {
          Cookies.set('page', parameterName[1]);
        }
      }
    }
  }

  function loadScreen() {
    var loadedPage = Cookies.get('page');
    if (loadedPage) {
      console.log("Resuming at page: " + loadedPage);
      var target = $('#navbar').find('#' + loadedPage);

      var activePage = $('#navbar').find('.active');
      activePage.removeClass('active');
      target.addClass('active');

      if (activePage.index() > target.index()) {
        handleScreenSwap(activePage.index(), target.index(), true); //active is left, so new is right
      }
      else {
        handleScreenSwap(activePage.index(), target.index(), false); //active is right, so new is left
      }
    }
  }

  var socket = io.connect('http://brct.io:4000');
  socket.on('connect', function(data) {
    socket.emit('join', 'Hello world from client');
  });
  socket.on('messages', function(data) {
    console.log("message: " + data);
  });
  socket.on('gameData', function(data) {
    console.log(data);
    $("#ideasStat").text("Ideas: " + data.ideas);
  });
  socket.on('userResponse', function(data) {
    if (data.accepted == true) {
      $('#usernameInput').val('');
      $('#pinInput').val('');
      Cookies.set('username', data.username);
      Cookies.set('pin', data.pin);
      console.log("Username set to: " + Cookies.get('username') + "#" + Cookies.get('pin'));
      handleGameLogin();
    }
    else {
      $('#pinInput').val('');
      $('#uResponseZone').text(data.responseMessage);
      console.log("Rejected username/pin");
    }

  });

  function tryUpdate() {
    var username = Cookies.get('username');
    var pin = Cookies.get('pin');
    if (username && pin) {
      socket.emit('reqData',{
        username: username,
        pin: pin
      })
    }
  }

  function init() {
    checkPageParameter();
    loadScreen();
    handleGameLogin();

    window.setInterval(tryUpdate, 2000);
  }

  init();
});
