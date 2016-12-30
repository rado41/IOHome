var mdns = require('multicast-dns')({reuseAddr: true});
var mdnsData = [];

mdns.on('response', function(response) {
  console.log("Recived MDNS Response");
  var info;
  response.answers.forEach(function(answer) {
    if(answer.type === 'A') {
      var info = answer.name.split('_');
      if(info && info[0] === 'iohome') {
        info = { ip : answer.data, rId: parseInt(info[1].split('.')[0].trim())};
        var exist = false;
        var i = 0;
        for(; i < mdnsData.length; i++) {
              var obj = mdnsData[i];
          if(obj.ip === info.ip && obj.rId === info.rId) {
            exist = true;
            break;
          } else if(obj.ip === info.ip) {
            mdnsData[i].rId = info.rId;
            break;
          } else if(obj.rId === info.rId) {
            mdnsData[i].ip = info.ip;
            break;
          }
        }
        if(!exist) {
          if(i === mdnsData.length) {
            info.maxPorts = 8;
            mdnsData.push(info);
          }

          console.log("SERVER <--- MDNS Handler");
          console.log(info);

          process.send(info);
        }
      }
    }
   });
});

mdns.on('request', function(request) {
});

var mdnsQuery = function() {
  console.log("MDNS QUERY ---> *");
  mdns.query({
    questions:[{
       name: '_http._tcp.local',
      type: 'PTR'
    }]
  });
}

process.on('message', function(info) {
  if(info.type === 'query') {
    mdnsQuery();
  }
});


setInterval(mdnsQuery,3000);
