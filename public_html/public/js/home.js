var socket = io.connect('http://localhost:8200');
socket.on('connect', function(data) {
  console.log(data);
   console.log('Player connected!', socket.id);
  socket.emit('join', 'ATSDADS');
});
