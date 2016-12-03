var mdns = require('mdns-js');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
//if you have another mdns daemon running, like avahi or bonjour, uncomment following line 
//mdns.excludeInterface('0.0.0.0'); 

 
// Connection URL 
var url = 'mongodb://localhost:27017/iohome';
 
var browser = mdns.createBrowser();
 
browser.on('ready', function () {
    browser.discover(); 
});
 
browser.on('update', function (data) {
	//console.log("Address: " + data.addresses[0] + " Port: "+data.port );
	if(data.txt){
		var idStr = data.txt[0].toString().split("_");
		if(idStr[0].indexOf("IOHome") == 0) {
			var ip = data.addresses[0];
			var id = idStr[1];
			console.log("ID: " + id + " IP: " +  ip);
			
			//Use connect method to connect to the Server 
			MongoClient.connect(url, function(err, db) {
			  assert.equal(null, err);
			  console.log("Connected correctly to server");
			  var udata = {};
			  udata["ip"] = ip;
			  udata["id"] = id;
	      updateDocuments(db,udata,function(){
			  	db.close();
			  });
			});
		}
	}
});

var updateDocuments = function(db,data,callback) {
  var collection = db.collection('nodes');
	collection.find({
    'id':data.id 
  }).toArray(function(err, docs) {
    if (!err) {
      if (docs.length > 0) {
				docs.forEach(function(doc){
					if(data.ip === doc.ip) {
						console.log("Same Data Record Already Exists");
					} else {
  					collection.update(data,data,{upsert:true});
					}
				});
      }
    } else {
      onErr(err, callback);
    }
  }); //end collection.find 
}
