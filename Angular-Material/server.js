var express           = require('express'),
    app               = express(),
    bodyParser        = require('body-parser'),
    mongoose          = require('mongoose'),
    approuter         = require('./approuter');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbController = require('./Server/Controllers/db-controller.js')

app.use('/Client', express.static(__dirname + '/Client'));
app.use('/Server', express.static(__dirname + '/Server'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

mongoose.connect("mongodb://localhost/iohome");

//All routing are done in this file
app.use(approuter);

io.on('connection', function(socket){

  dbController.getAll(function(error,results){
    var test = {};
    test.rooms = results;
    io.emit('home', test);
  });

  socket.on('toggleport',function(info){
    dbController.togglePort(info,function(error,result) {
      socket.broadcast.emit('portUpdate',info);
    });
  });

  socket.on('addport',function(info){
    console.log(info);
    dbController.addPort(info,function(error,result) {
      socket.broadcast.emit('addport',info);
    });
  });

  socket.on('editport',function(info){
    dbController.editPort(info,function(error,result) {
      socket.broadcast.emit('pUpdate',info);
    });
  });

  socket.on('delport',function(info){
    dbController.delPort(info,function(error,result) {
      socket.broadcast.emit('delport',info);
    });
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

// app.listen(80, function () {
//   console.log('Example app listening on port 80! Click on http://127.0.0.1/')
// });

http.listen(80, function(){
  console.log('listening on *:80');
});
