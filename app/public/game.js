$(document).ready(function() {

  var userInfo = {};
  var isLoading = true;

  /*
  SOCKET.IO - Emits and Ons
  */

  var socket = io.connect('http://brct.io:4000');
  socket.on('connect', function(data) {
    socket.emit('join', 'Hello world from client');
    tryUpdate();
  });
  socket.on('messages', function(data) {
    //console.log("message: " + data);
  });
  socket.on('gameData', function(data) {
    //console.log("Received data at ", Date.now(), ": ", data);
    //$("#ideasStat").text("Ideas: " + data.ideas);
    userInfo = data;
    isLoading = false;
    checkLoaded();
    checkLevelUp(data);
    printStats(data);
  });
  socket.on('userResponse', function(data) {
    if (data.accepted === true) {
      $('#usernameInput').val('');
      $('#pinInput').val('');
      if (data.username && data.pin) {
        Cookies.set('username', data.username);
        Cookies.set('pin', data.pin);
        //console.log("Username set to: " + Cookies.get('username') + "#" + Cookies.get('pin'));
      }
      handleGameLogin();
    }
    else {
      $('#uResponseZone').text(data.responseMessage);
      //console.log("data.responseMessage");
    }
  });

  /*
  DOM EVENTS - Buttons and the like
  */

  //Handling new user stuff
  $("#username").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    //console.log(clickedButton);
    var username = $("#usernameInput").val();
    var pin = ("0000" + $("#pinInput").val()).slice(-4);
    if (clickedButton == 'submit') {
      socket.emit('newUser', {
        username: username,
        pin: pin
      });
    }
  });

  //Handling user controls like deletion and logging out
  $("#userControls").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    //console.log(clickedButton);
    if (clickedButton == 'logout') {
      Cookies.set('username', '');
      Cookies.set('pin', '');
      //console.log("Logged out." + Cookies.get('username'));
    }
    if (clickedButton == 'deleteUser') {
      var confirmed = confirm("Please confirm deletion of user: " + Cookies.get('username') + "#" + Cookies.get('pin'));
      if (confirmed === true) {
        socket.emit('delUser', {
          username: Cookies.get('username'),
          pin: Cookies.get('pin')
        });
        Cookies.set('username', '');
        Cookies.set('pin', '');
      }
    }
    isLoading = true;
    handleGameLogin();
  });

  //Handling game-related clicking
  $(".area").on("click","button",function(e){
    e.preventDefault();
    var clickedButton = e.target.id.substring(0,e.target.id.length - 6);
    //console.log(clickedButton);
    var amnt = 1;
    if (clickedButton == "ideas") {
      if (userInfo.designs != null) {
        amnt += parseInt(userInfo.designs);
        if (userInfo.artwork != null) {
          amnt += parseInt(userInfo.artwork) * 15;
        }
      }
    }
    else if (clickedButton == "designs" && userInfo.functions != null) {
      amnt += parseInt(userInfo.functions);
    }
    if (clickedButton == "ideas") {
      emitIClick(clickedButton, amnt);
    }
    else if (clickedButton == "designs" && userInfo.ideas >= 100) {
      emitIClick(clickedButton, amnt);
    }
    else if (clickedButton == "artwork" && userInfo.designs >= 10) {
      emitIClick(clickedButton, amnt);
    }
    else if (clickedButton == "functions" && userInfo.designs >= 100) {
      emitIClick(clickedButton, amnt);
    }
  });

  /*
  OTHER FUNCTIONS
  */

  function emitIClick(button, amnt) {
    socket.emit('incrementalClicked', {
      username: Cookies.get('username'),
      pin: Cookies.get('pin'),
      type: button,
      amount: amnt
    });
  }

  function printStats(data) {
    var entries = Object.entries(data);
    //console.log("Entries: ", entries);
    for (var i = 0; i < entries.length; i++) {
      var pair = entries[i];
      //console.log("Pair (#" + pair[0] + "Stat): ");
      var keyObj = $("#" + pair[0] + "Stat");
      if (keyObj) {
        keyObj.text(upperFirst(pair[0]) + ": " + pair[1]);
        //console.log(upperFirst(pair[0]) + ": " + pair[1]);
      }
    }
  }

  function checkLevelUp(data) {
    if (data.ideas >= 100 || data.designs) {
      $("#designsSet").show();
    }
    else {
      $("#designsSet").hide();
      $("#designsStat").text("Designs: 0");
    }
    if (data.designs >= 10 || data.artwork) {
      $("#artworkSet").show();
    }
    else {
      $("#artworkSet").hide();
      $("#artworkStat").text("Artwork: 0");
    }
    if (data.designs >= 100 || data.functions) {
      $("#functionsSet").show();
    }
    else {
      $("#functionsSet").hide();
      $("#functionsStat").text("Functions: 0");
    }
  }

  function upperFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function tryUpdate() { //try to request data if possible
    if (socket.connected && Cookies.get('username')) {
      var username = Cookies.get('username');
      var pin = Cookies.get('pin');
      //console.log("Asking nicely for updated data at", Date.now());
      if (username && pin) {
        socket.emit('reqData',{
          username: username,
          pin: pin
        });
      }
    }
    else {
      //console.log("SOCKET NOT CONNECTED YET");
    }
  }

  function checkLoaded() {
    //console.log(Cookies.get('username'))
    if (isLoading) {
      $('#gameArea').hide();
      $('#loading').show();
    }
    else {
      $('#gameArea').show();
      $('#loading').hide();
    }
    if (!Cookies.get('username')) {
      $('#loading').hide();
    }
  }

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
    checkLoaded();
  }

  function startGame() {
    checkLoaded();
    window.setInterval(tryUpdate, 2000);
  }

  startGame();
});
