var request = require('request');

module.exports = {};

module.exports.updatePort = function(ip,port,status,cb) {
	console.log("Client Handler: " + status);
	var val = status?1:0;
	var urlStr = "http://"+ip+"/update?port="+port+"&val="+val;
	console.log(urlStr);
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
