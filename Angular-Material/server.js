var express           = require('express'),
    app               = express(),
    bodyParser        = require('body-parser'),
    mongoose          = require('mongoose'),
    child_process     = require('child_process'),
    approuter         = require('./approuter');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var dbController = require('./Server/Controllers/db-controller.js');
var mdnsHandler = child_process.fork(`${__dirname}/mdnsHandler.js`);

app.use('/Client', express.static(__dirname + '/Client'));
app.use('/Server', express.static(__dirname + '/Server'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

mongoose.connect("mongodb://localhost/iohome");

//All routing are done in this file
app.use(approuter);

//MDNS Updates are sent to us by mdnsHandler
// info: { rId: Node ID/Room ID,
//         ip: NodeIP address }
mdnsHandler.on('message',function(info) {
  dbController.nodeUpdate(info,function(err,result){
    console.log("MDNS Update: "+ info);
  });
});

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

http.listen(80, function(){
  console.log('listening on *:80');
});
