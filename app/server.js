// require all dependencies
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
const io = require('socket.io')(server);

// set up the template engine
app.set('views', path.join(__dirname, '.', 'views'));
app.set('view engine', 'pug');
 
// GET response for '/'
app.get('/', function (req, res) {
 
    // render the 'index' template, and pass in a few variables
    res.render('index', { title: 'Hey', message: 'Hello there!' });
 
});
 
// start up the server
server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});
 
