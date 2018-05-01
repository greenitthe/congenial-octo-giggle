// require all dependencies
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
const io = require('socket.io')(server);
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
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
  res.render('index', { title: 'brct.io', message: 'Under Construction' });
  //res.render('index', { title: 'brct.io', message: '' });
});

var info = {};

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(data) {
    console.log(data);

    client.emit('messages', 'Hello from server');
  });
  client.on('newUser', function(data) {
    var isAccepted = true;
    var responseMessage = "New User Accepted";
    var fullName = data.username + "#" + data.pin;
    if (info[fullName]) {
      console.log("Old user logged in: '" + fullName + "'");
      responseMessage = "Existing User Rejected";
    }
    else {
      console.log("New user accepted: '" + fullName + "'");
    }
    client.emit('userResponse', {
      accepted: isAccepted,
      responseMessage: responseMessage,
      username: data.username,
      pin: data.pin
    });
  });
  client.on('reqData', function(data) {
    var fullName = data.username + "#" + data.pin;
    console.log(fullName + " | reqData");
    if (!info[fullName]) {
      info[fullName] = {};
      info[fullName]["ideas"] = 0;
    }
    console.log(info[fullName])
    client.emit('gameData', info[fullName]);
  });
  client.on('incrementalClicked', function(data) {
    var fullName = data.username + "#" + data.pin;
    console.log(fullName + " | " + data.type);
    if (!info[fullName]) {
      info[fullName] = {};
      info[fullName][data.type] = 0;
    }
    info[fullName][data.type]++;
    console.log(info[fullName]);
    client.emit('gameData', info[fullName]);
  })
});

// start up the server
server.listen(4000, function () {
  console.log('Listening on http://localhost:4000');
});
