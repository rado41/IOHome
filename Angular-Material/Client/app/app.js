var app = angular.module('iohome', ['ngMaterial','ngRoute','ngResource','chart.js']);

app.config(function($routeProvider,$locationProvider,$mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue')
  .accentPalette('blue')
  .dark();

  $routeProvider.when("/home", {
      templateUrl: "Client/app/views/home.html",
      controller: "homeCtrl"
    })
    .when("/dashboard", {
      templateUrl: "Client/app/views/dashboard.html",
      controller: "dashboardCtrl"
    })
    .otherwise({
      redirectTo: "/home"
    });
});

app.factory("ioHomeService", ["$rootScope", function($rootScope) {
  var svc = {
      homeData: {},
      nodata: true,
      tabs: []
  };

  Array.prototype.remove = function(item) {
      for(var i = 0; i < this.length; i++) {
          if(this[i] == item) {
              this.splice(i, 1);
          }
      }
  }

  // {
  //   name: "My Sweet Home",
  //   rooms: [
  //     {
  //       name: "Room 1",
  //       maxPorts: "8",
  //       ports: [
  //         { name: "Port 1", anchorPort: "1", status: false, pId: "449375"},
  //         { name: "Port 2", anchorPort: "2", status: true, pId: "580644"},
  //         { name: "Port 3", anchorPort: "3", status: false, pId: "404896"},
  //         { name: "Port 4", anchorPort: "4", status: true, pId: "226156"},
  //       ],
  //       id: "608618",
  //     },
  //     {
  //       name: "Room 2",
  //       maxPorts: "8",
  //       ports: [
  //         { name: "Port 1", anchorPort: "1", status: false, pId: "949937"},
  //         { name: "Port 2", anchorPort: "2", status: true, pId: "238177"},
  //         { name: "Port 3", anchorPort: "3", status: false,pId: "130151"},
  //         { name: "Port 4", anchorPort: "4", status: true, pId: "522526"},
  //       ],
  //       id: "618618",
  //     },
  //     {
  //       name: "Room 3",
  //       maxPorts: "8",
  //       ports: [
  //         { name: "Port 1", anchorPort: "1", status: false, pId: "911518"},
  //         { name: "Port 2", anchorPort: "2", status: true, pId: "012215"},
  //         { name: "Port 3", anchorPort: "3", status: false,pId: "834221"},
  //         { name: "Port 4", anchorPort: "4", status: true, pId: "775956"},
  //       ],
  //       id: "628618",
  //     },
  //     {
  //       name: "Room 4",
  //       maxPorts: "8",
  //       ports: [
  //         { name: "Port 1", anchorPort: "1", status: false, pId: "911518"},
  //         { name: "Port 2", anchorPort: "2", status: true, pId: "012215"},
  //         { name: "Port 3", anchorPort: "3", status: false, pId: "834221"},
  //         { name: "Port 4", anchorPort: "4", status: true, pId: "775956"},
  //       ],
  //       id: "638618",
  //     },
  //   ],
  // };

  var socketio = io();
  socketio.on('home', function(result){
    console.log(result);
  	if(result) {
      $rootScope.$apply(function() {
        svc.homeData = result;
        svc.dataready = true;
        svc.tabs = [];
        svc.homeData.rooms.forEach(function(room,index){
          if(room.name) {
            svc.tabs.push({title: room.name, id: room.rId, maxPorts : room.maxPorts, ports: room.ports});
          } else {
            svc.tabs.push({title: room.rId, id: room.rId, maxPorts : room.maxPorts, ports: room.ports});
          }
        });
      });
  	}
  });

  svc.updatePortStatus = function(info) {
    $rootScope.$apply(function() {
      for(var i = 0; i < svc.homeData.rooms.length; i++) {
        if(svc.homeData.rooms[i].rId === info.rId) {
          for(var j = 0; j < svc.homeData.rooms[i].ports.length; j++) {
            if(svc.homeData.rooms[i].ports[j].pId === info.pId) {
              svc.homeData.rooms[i].ports[j].status = info.status;
              break;
            }
          }
          break;
        }
      }
    });
  }

  socketio.on('portUpdate',function(info) {
    svc.updatePortStatus(info);
  });

	socketio.on('dash', function(result){
      console.log(result);
  });

  socketio.on('pUpdate',function(info){
    console.log(info);
    $rootScope.$apply(function(){
      for(var i = 0; i < svc.homeData.rooms.length; i++) {
        if(svc.homeData.rooms[i].rId === info.rId) {
          for(var j = 0; j < svc.homeData.rooms[i].ports.length; j++) {
            if(svc.homeData.rooms[i].ports[j].pId === info.pId) {
              svc.homeData.rooms[i].ports[j] = info.portInfo;
              break;
            }
          }
          break;
        }
      }
    });
  });

  socketio.on('addport',function(info) {
    $rootScope.$apply(function() {
      for(var i = 0; i < svc.homeData.rooms.length; i++) {
        if(svc.homeData.rooms[i].rId === info.rId) {
          svc.homeData.rooms[i].ports.push(info.portInfo);
          break;
        }
      }
    });
  });

  socketio.on('delport',function(info) {

    var room = svc.getRoom(info.rId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        if(room.ports[i].pId == info.pId) {
          $rootScope.$apply(function() {
            room.ports.remove(room.ports[i]);
          });
          break;
        }
        i++;
      }
    }
  });

  svc.getRooms = function() {
    if(!nodata) return homeData;
    else return null;
  };

  svc.getRoom = function(rId) {
    if(svc.homeData  && svc.homeData.rooms){
      for(var i = 0; i < svc.homeData.rooms.length; i++ ) {
        if(svc.homeData.rooms[i].rId === rId) {
          return svc.homeData.rooms[i];
        }
      }
    }
  };

  svc.getRoomName = function(rId){
    var room = svc.getRoom(rId);
    if(room) return room.name;
  }

  function indexedArray(n) {
    var x=[],
        i=1;
    while(x.push(i++)<n);
    return x;
  }

  svc.getAvailePorts = function(rId) {
    try {
      var room = svc.getRoom(rId);
      usedPorts = [];
      if(room && room.ports) {
        room.ports.forEach(function(port){
          usedPorts.push(parseInt(port.anchorPort));
        });
      }

      return indexedArray(room.maxPorts).filter(function(x) {
          return (usedPorts.indexOf(x) == -1);
        });
    } catch(e) {
      return undefined;
    }
  }

  svc.getPortInfo = function(rId,pId) {
    var room = svc.getRoom(rId);
    if(room && room.ports) {
      for(var i = 0; i < room.ports.length; i++) {
        if(room.ports[i].pId == pId) {
          return room.ports[i];
        }
      }
    }
  }

  svc.togglePort = function(rId,pId,tstatus) {
    socketio.emit('toggleport',{rId: rId, pId: pId, status:tstatus });
  }

  svc.addNewPort = function(rId,portInfo) {
    var room = svc.getRoom(rId);
    portInfo["pId"] = parseInt(Math.random().toString().slice(2,8));
    room.ports.push(portInfo);
    socketio.emit('addport',{rId: rId, pId: portInfo.pId, portInfo:portInfo});
  }


  svc.deletePort = function(rId,pId) {
    var room = svc.getRoom(rId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        if(room.ports[i].pId == pId) {
          room.ports.remove(room.ports[i]);
          socketio.emit('delport',{rId: rId, pId: pId});
          break;
        }
        i++;
      }
    }
  }

  svc.updatePort = function(rId,portInfo) {
    console.log(portInfo);
    var room = svc.getRoom(rId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        console.log(room.ports[i].pId);
        if(room.ports[i].pId == portInfo.pId) {
          room.ports[i].name = portInfo.name;
          socketio.emit('editport',{rId: rId, pId: portInfo.pId, portInfo});
          break;
        }
        i++;
      }
    }
  }

  return svc;
}]);

app.controller('AppCtrl', function($scope,$location,$mdSidenav) {
  $scope.sideNavActive = false;
  $scope.showDash = true;
  $scope.showAlert = true;

  $scope.settings = [
	  { name: "Dashbaoard",
	  	icon: "Client/app/resources/images/icons/svg/insert_chart.svg",
	  	status: $scope.showDash,
	  },
  ];

  $scope.quickSettingHandler = function(setting) {
    if(setting.name === "Dashbaoard"){
    	$scope.showDash = setting.status;
    }
  };

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
    $scope.sideNavActive = !$scope.sideNavActive;
  };

  $scope.home = function() {
  	if($scope.sideNavActive) {
      $mdSidenav('left').toggle();
  	}
    $scope.sideNavActive = false;
  	$location.path("/home");
  }

  $scope.showDashboard = function() {
  	$location.path("/dashboard");
  }

});
