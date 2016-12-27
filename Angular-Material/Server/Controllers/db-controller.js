var IOhome = require('../Models/iohome');

module.exports.nodeUpdate = function (info, cb) {
  IOhome.nodes.update(
    {rId: info.rId},
    { rId : info.rId , ip : rId.ip },
    { upsert : true },
    cb
  );
}

module.exports.editRoom = function (req, res) {
}

module.exports.addPort = function (info, cb) {
  IOhome.rooms.update(
    { rId: info.rId},
    { $push : {
                ports: info.portInfo
              }
    },
    cb
  );

}

module.exports.togglePort = function (info, cb) {
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
}

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
}

module.exports.addSchedule = function (req, res) {
}

module.exports.editSchedule = function (req, res) {
}

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
        console.log(nodeIds);
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
