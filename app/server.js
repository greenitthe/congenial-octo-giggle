// require all dependencies
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
const io = require('socket.io')(server);

// set up the template engine
app.set('views', path.join(__dirname, '.', 'views'));
app.set('view engine', 'pug');

app.get('/js/client.js', function(req, res) {
  res.sendFile(path.resolve('./app/public/js/client.js'));
})

// GET response for '/'
app.get('/', function (req, res) {
 
    // render the 'index' template, and pass in a few variables
    res.render('index', { title: 'Hey', message: 'Hello there!' });
 
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);

        client.emit('messages', 'Hello from server');
    });
});
 
// start up the server
server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});
 
