var request = require('request');

module.exports = {};

module.exports.updatePort = function(ip,port,status,cb) {
  var urlStr = "http://"+ip+"/update?port="+port+"&status="+status;
  request.post(
    {
      url:urlStr,
    },
    cb
  )
}

module.exports.measurePower = function(ip,port,cb) {
  var urlStr = "http://"+ip+"/measure?port="+port;
  request.post(
    {
      url:urlStr,
    },
    cb
  )
}
