// require all dependencies
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
const io = require('socket.io')(server);
var redis = require('redis');
var rClient = redis.createClient();

rClient.on('connect', function() {
  console.log('Redis connected');
});

// set up the template engine
app.set('views', path.join(__dirname, '.', 'views'));
app.set('view engine', 'pug');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/includes', express.static(path.join(__dirname, 'includes')));
app.use('/nodeScripts', express.static(path.join('../', __dirname, 'node_modules')));

// GET response for '/'
app.get('/', function (req, res) {

  // render the 'index' template, and pass in a few variables
  //res.render('index', { title: 'brct.io', message: 'Under Construction' });
  res.render('index', { title: 'brct.io', message: 'Hello World! I am being presented today!' });
  //res.render('index', { title: 'brct.io', message: '' });
});

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(data) {
    console.log(data);

    client.emit('messages', 'Hello from server');
  });
  client.on('newUser', function(data) {
    var isAccepted = true;
    var responseMessage = "New User Accepted";
    var fullname = data.username + "#" + data.pin;
    rClient.hgetall(fullname, function (err, obj) {
      if (obj) {
        console.log("Old user logged in: '" + fullname + "'");
        responseMessage = "Existing User Accepted";
      }
      else {
        console.log("New user accepted: '" + fullname + "'");
        newClient(fullname);
      }
    });
    client.emit('userResponse', {
      accepted: isAccepted,
      responseMessage: responseMessage,
      username: data.username,
      pin: data.pin
    });
  });
  client.on('delUser', function(data) {
    var isAccepted = true;
    var responseMessage = "User Deleted";
    var fullname = data.username + "#" + data.pin;
    rClient.del(fullname, function (err, obj) {
      if (obj) {
        console.log("Deleted User: '" + fullname + "'");
      }
      else {
        console.log("No User With Name: '" + fullname + "'");
        responseMessage = "No user to delete by that name";
      }
    });
    client.emit('userResponse', {
      accepted: isAccepted,
      responseMessage: responseMessage
    });
  });
  client.on('reqData', function(data) {
    var fullname = data.username + "#" + data.pin;
    console.log(fullname + " | reqData");
    sendData(client, fullname);
  });
  client.on('incrementalClicked', function(data) {
    var fullname = data.username + "#" + data.pin;
    console.log(fullname, "\n", data);
    if (data.type != "ideas") {
      handlePurchase(fullname, data.type, data.amount);
    }
    else {
      incrementData(fullname, data.type, data.amount);
    }
    sendData(client, fullname);
  });
});

function newClient(fullname) {
  if (!fullname.includes("undefined")) {
    rClient.hmset(fullname, {
      "ideas": 0
    });
  }
}

function handlePurchase(fullname, type, amount) {
  if (type == "designs") {
    incrementData(fullname, "ideas", -100);
  }
  else if (type == "artwork") {
    incrementData(fullname, "designs", -10);
  }
  else if (type == "functions") {
    incrementData(fullname, "designs", -100);
  }
  incrementData(fullname, type, amount);
}

function incrementData(fullname, type, amount) {
  if (!isNaN(amount) && amount !== null) {
    rClient.hincrby(fullname, type, amount);
  }
}

function sendData(client, fullname) {
  rClient.hgetall(fullname, function(err, obj) {
    if (!obj) {
      newClient(fullname);
      sendData(client, fullname);
    }
    else {
      console.log("  ", obj);
      client.emit('gameData', obj);
    }
  });
}

// start up the server
server.listen(4000, function () {
  console.log('Listening on http://localhost:4000');
});
