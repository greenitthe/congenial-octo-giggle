var socket = io.connect('http://brct.io:8080');
socket.on('connect', function(data) {
    socket.emit('join', 'Hello world from client');
});
socket.on('messages', function(data) {
    console.log(data);
});
