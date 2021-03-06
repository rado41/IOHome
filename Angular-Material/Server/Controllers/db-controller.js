var IOhome = require('../Models/iohome');

module.exports.clearNodes = function(cb) {
  IOhome.nodes.remove({}, cb);
}

module.exports.nodeUpdate = function (info, cb) {
  IOhome.nodes.update(
    {rId: info.rId},
    { rId : info.rId , ip : info.ip },
    { upsert : true },
    cb
  );
}

module.exports.addRoom = function (info, cb) {
  console.log("Add Room: " );
  console.log(info);
  IOhome.rooms.update(
    { rId: info.rId },
    { rId : info.rId , maxPorts: info.maxPorts, ports: info.ports },
    { upsert : true },
    cb
  );
}

module.exports.getRoom = function (roomId, cb) {
  IOhome.rooms.findOne({rid: roomId},cb);
}

module.exports.getIp = function(roomId,cb) {
	console.log("RoomId: " + roomId);
	IOhome.nodes.find(
		{rId: roomId},
		{_id: 0, rId: 0},
		cb
	)
};


module.exports.addPort = function (info, cb) {
  IOhome.rooms.update(
    { rId: info.rId},
    { $push : {
                ports: info.portInfo
              }
    },
    cb
  );
};

module.exports.getPort = function(roomId,portId,cb) {
	IOhome.rooms.findOne(
		{rId: roomId, "ports.pId": portId},
		{"ports.$.pId":1},
		cb
	);

}

module.exports.togglePort = function (info, cb) {
	console.log(info);
  IOhome.rooms.update(
    { rId: info.rId, "ports.pId": info.pId},
    { $set : {"ports.$.status" : info.status } },
    cb
  );
};

module.exports.editPort = function (info, cb) {
  IOhome.rooms.update(
    { rId: info.rId, "ports.pId": info.portInfo.pId},
    { $set : {
              "ports.$.status" : info.portInfo.status,
              // "ports.$.description" : info.description,
              "ports.$.anchorPort" : info.portInfo.anchorPort,
              "ports.$.name" : info.portInfo.name
              // "ports.$.schedules" : info.schedules,
             }
    },
    cb
  );
};

module.exports.delPort = function(info,cb) {
  IOhome.rooms.update(
    { rId: info.rId},
    { $pull : {
                ports: {
                  pId: info.pId
                }
              }
    },
    cb
  );
};

module.exports.addSchedule = function (req, res) {
};

module.exports.editSchedule = function (req, res) {
};

module.exports.getAll = function (cb) {
  // var test;
  // IOhome.globals.find(
  //   {name: "iohomeName"},
  //   {_id: 0},
  //   {lean: true},
  //   function(err,results) {
  //     if(err) {
  //       cb("NO_CONFIG",undefined);
  //     } else {
  //       console.log(results[0].name);
  //       console.log(results[0].value);
  //     }
  //   }
  // );

  IOhome.nodes.find(
    {},
    {_id: 0},
    function(err,results){
      if(err) {
        console.log("Error occured")
        cb("NO_NODES",undefined);
      } else {
        var nodeIds = [];
        results.forEach(function(result){
          nodeIds.push(result.rId);
        });
        
        IOhome.rooms.find(
          { rId: {
              $in: nodeIds,
            }
          },
          {_id: 0},
          cb
        );
      }
    }
  );
}
