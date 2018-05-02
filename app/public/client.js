$(document).ready(function() {
  function handleGameLogin() {
    var username = Cookies.get('username');
    var pin = Cookies.get('pin');
    if (username) {
      $('#username').hide();
      $('#gameArea').show();
      $('#userControls').show();
      $('#usernameInfo').text(username + "#" + pin);
      //tryUpdate();
    }
    else {
      $('#gameArea').hide();
      $('#userControls').hide();
      $('#username').show();
      $('#usernameInfo').text('');
    }
  }

  $("#usernameInput").keyup(function(e) {
    $("#usernameInput").val(this.value.match(/[A-z]*/));
    if (e.which == 13) {
      $('#submitButton').trigger("click");
    }
  });

  $("#pinInput").keyup(function(e) {
    $('#pinInput').val(this.value.match(/[0-9]*/));
    if (e.which == 13) {
      $('#submitButton').trigger("click");
    }
  });

  $("#navbar").on("click", "li", function(e) {
    //Create a target variable for less querying
    $target = $(e.target);
    e.preventDefault();
    //If you are already on the right page, then don't bother
    if ($target.hasClass("active")) {
      return;
    } else {
      //If you aren't, set this as the active page, change screen
      var activePage = $('#navbar').find('.active');
      activePage.removeClass('active');
      $target.addClass('active');

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
    if (isRight === false) {
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
    //console.log(targetID);
    Cookies.set('page', targetID);
  }

  function checkPageParameter() {
    var pageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = pageURL.split('&'),
        parameterName,
        i;
    for (i=0; i < URLVariables.length; i++) {
      parameterName = URLVariables[i].split('=');

      if (parameterName[0] === "page" && parameterName[1] != undefined) {
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
      //console.log("Resuming at page: " + loadedPage);
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

  function init() {
    checkPageParameter();
    loadScreen();
    handleGameLogin();

    $("#designsSet").hide();
  }

  init();
});
