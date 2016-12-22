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

app.factory("ioHomeService", ["$rootScope","$resource", function($rootScope,$resource) {
  var svc = {};

  Array.prototype.remove = function(item) {
      for(var i = 0; i < this.length; i++) {
          if(this[i] == item) {
              this.splice(i, 1);
          }
      }
  }

  var homeData = {
    name: "My Sweet Home",
    rooms: [
      {
        name: "Room 1",
        maxPorts: "8",
        ports: [
          { name: "Port 1", anchorPort: "1", status: false, portId: "449375"},
          { name: "Port 2", anchorPort: "2", status: true, portId: "580644"},
          { name: "Port 3", anchorPort: "3", status: false, portId: "404896"},
          { name: "Port 4", anchorPort: "4", status: true, portId: "226156"},
        ],
        id: "608618",
      },
      {
        name: "Room 2",
        maxPorts: "8",
        ports: [
          { name: "Port 1", anchorPort: "1", status: false, portId: "949937"},
          { name: "Port 2", anchorPort: "2", status: true, portId: "238177"},
          { name: "Port 3", anchorPort: "3", status: false,portId: "130151"},
          { name: "Port 4", anchorPort: "4", status: true, portId: "522526"},
        ],
        id: "618618",
      },
      {
        name: "Room 3",
        maxPorts: "8",
        ports: [
          { name: "Port 1", anchorPort: "1", status: false, portId: "911518"},
          { name: "Port 2", anchorPort: "2", status: true, portId: "012215"},
          { name: "Port 3", anchorPort: "3", status: false,portId: "834221"},
          { name: "Port 4", anchorPort: "4", status: true, portId: "775956"},
        ],
        id: "628618",
      },
      {
        name: "Room 4",
        maxPorts: "8",
        ports: [
          { name: "Port 1", anchorPort: "1", status: false, portId: "911518"},
          { name: "Port 2", anchorPort: "2", status: true, portId: "012215"},
          { name: "Port 3", anchorPort: "3", status: false, portId: "834221"},
          { name: "Port 4", anchorPort: "4", status: true, portId: "775956"},
        ],
        id: "638618",
      },
    ],
  };

  svc.getRooms = function() {
    return homeData;
  };

  svc.getRoom = function(roomId) {
    if(homeData && homeData.rooms){
      var i = 0,
          n = homeData.rooms.length;
      while(i<n){
        if(homeData.rooms[i].id === roomId) {
          return homeData.rooms[i];
        }
        i++;
      }
    }
  };

  svc.getRoomName = function(roomId){
    var room = svc.getRoom(roomId);
    if(room) return room.name;
  }

  function indexedArray(n) {
    var x=[],
        i=1;
    while(x.push(i++)<n);
    return x;
  }

  svc.getAvailePorts = function(roomId) {
    try {
      var room = svc.getRoom(roomId);
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

  svc.getPortInfo = function(roomId,portId) {
    var room = svc.getRoom(roomId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        if(room.ports[i].portId == portId) {
          return room.ports[i];
        }
        i++;
      }
    }
  }

  svc.togglePort = function(roomId,portId) {
    var room = svc.getRoom(roomId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        if(room.ports[i].portId == portId) {
          console.log("SUCCESS");
          break;
        }
        i++;
      }
    }
  }

  svc.addNewPort = function(roomId,portInfo) {
    var room = svc.getRoom(roomId);
    portInfo["portId"] = Math.random().toString().slice(2,8);
    room.ports.push(portInfo);
  }

  svc.deletePort = function(roomId,portId) {
    var room = svc.getRoom(roomId);
    if(room && room.ports) {
      var i = 0;
      var n = room.ports.length;
      while(i<n) {
        if(room.ports[i].portId == portId) {
          room.ports.remove(room.ports[i]);
          break;
        }
        i++;
      }
    }
  }

  svc.updatePort = function(roomId,portInfo) {
    console.log("OK");
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
