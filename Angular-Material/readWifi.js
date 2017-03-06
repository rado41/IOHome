const fs = require('fs');
const execSync = require('child_process').execSync;
var wpa_cli= require('wireless-tools/wpa_cli');
var request = require('request');

const IFACE = 'wlan0';

var network = {ssid: 'IOHome_9481412'};
var essid;

wpa_cli.status(IFACE, function(err,status) {
	if(!err) essid = status.ssid;
	console.log("Currenly connected to " + essid);
	
  const file = "/etc/wpa_supplicant/wpa_supplicant.conf";
  const nwRe = /network={((\s*\S*)*?)\n}/gm;

	fs.open(file, 'r', (err, fd) => {
	  if (err) {
	    if (err.code === "ENOENT") {
	      console.error('myfile does not exist');
	      return;
	    } else {
	      throw err;
	    }
	  } else {
			fs.readFile(fd,'utf8',function(err,data) {
				if(err) throw err;
				var matches = getMatches(data,nwRe,0);
				var ssid, psk, key_mgmt;
				if(matches.length) {
					for(var i = 0, nw = matches[i]; i < matches.length; i++) {
						console.log(i + ": " + nw)
						ssid = /ssid="(\S+)"/.exec(nw)[1];	
						if(ssid === essid) {
							psk  = /psk="(\S+)"/.exec(nw)[1];	
					  	key_mgmt = /key_mgmt=(\S+)/.exec(nw)[1];	
							wpa_cli.disconnect(IFACE,function(err) {
								if(err) throw err;
								console.log("Disconnected from " + ssid);

								wpa_cli.connectToWifi({ssid: network.ssid}, function(err) {
									if(err) throw err;
									console.log("Connected to " + network.ssid);
									var tmp = execSync('dhclient').toString();
									console.log(tmp);
									tmp = 'http://192.168.4.1/config?ssid=' + ssid + '&pwd=' + psk;
									console.log(tmp);
									request
										.get(tmp)
										.on('response', function(response) { 
												console.log(response.statusCode);
											  wifi.resetWifi(function(err) {
													console.log("Disconnected from " + inetwork.ssid);
													if(err) throw err;
													wifi.connectToWifi({ssid: ssid, password: psk}, function(err) {
														console.log("Connected back to " + ssid);
														console.log("Done");
													}); // connect back
												});	// disconnect
											}) // response
								}); //connect
							}); //disconnect
						}
					};
				}
			});
	  }
	});
});



function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}
