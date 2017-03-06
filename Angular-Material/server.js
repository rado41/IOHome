const express           = require('express'),
     app               = express(),
     bodyParser        = require('body-parser'),
     mongoose          = require('mongoose'),
     child_process     = require('child_process'),
     approuter         = require('./approuter');
		 http = require('http').Server(app);
		 io = require('socket.io')(http);

var dbController = require('./Server/Controllers/db-controller.js');
var mdnsHandler = child_process.fork(`${__dirname}/mdnsHandler.js`);
var clientHandler = require('./socketHandler');

app.use('/Client', express.static(__dirname + '/Client'));
app.use('/Server', express.static(__dirname + '/Server'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

mongoose.connect("mongodb://localhost/iohome");

//All routing are done in this file
app.use(approuter);

//Clear Nodes to reflect actual existing nodes
dbController.clearNodes(function(err,result) {
	if(!err) {
		console.log("Nodes are dropped");
	}
});

//MDNS Updates are sent to us by mdnsHandler
// info: { rId: Node ID/Room ID,
//         ip: NodeIP address,
//         maxPorts: Maximum ports supported}
mdnsHandler.on('message',function(info) {
  dbController.nodeUpdate(info,function(err,result){
    if(!err) {
      dbController.getRoom(info.rId, function(err,result){
        if(!err) {
          //If not already exists, add to rooms collection with ports set to []
            info.ports = [];
            dbController.addRoom(info,function(err,result){
              dbController.getAll(function(err,results) {
                var test = {};
                test.rooms = results;
                io.emit('home',test);
              });
            });
        } else {
          //If already exist, just change the max ports if it changed
        }
      });
    }
  });
});


mdnsHandler.send({type: 'query'});

io.on('connection', function(socket){

  dbController.getAll(function(error,results){
    var test = {};
    test.rooms = results;
    io.emit('home', test);
  });

  socket.on('toggleport',function(info){
		dbController.getIp(info.rId,function(err,nodeInfo){
		  if(!err) {
				var ip = nodeInfo[0].ip;
				dbController.getPort(info.rId,info.pId,function(err2,portInfo){
					if(!err2) {
						var port = portInfo.ports[0].anchorPort;
						console.log("IP : " + ip + " Port: " + port + " Status: "+ info.status);
						clientHandler.updatePort(ip,port,info.status,function(err,httpResponse,body) {
		    			console.log(err);
		    			//console.log(body);
		    			//console.log(httpResponse);
		    			dbController.togglePort(info,function(error,result) {
		    			  socket.broadcast.emit('portUpdate',info);
		    			});
		    		});
					} else {
						console.log("no Port info");
					}
		  	});
		  } else {
				console.log("no IP");
			}
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

	socket.on('onboard', function() {
		console.log("Onboard");
	});

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

http.listen(80, function(){
  console.log('listening on *:80');
});
