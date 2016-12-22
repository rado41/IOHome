app.controller("homeCtrl",["$scope","$mdDialog","ioHomeService",function($scope,$mdDialog,ioHome){
	// $scope.nodata = true;
	$scope.data = ioHome.getRooms();

	// setTimeout(function(){
	// 	$scope.nodata = false;
	// 	$scope.data = ioHome.getRooms();
	// 	console.log($scope.data);
	// },5000);

	$scope.selectedIndex = 1;
	$scope.tabs = [];
  $scope.isOpen = false;
  $scope.selectedMode = 'md-fling';
	$scope.status = undefined;

	if($scope.data) {
		$scope.data.rooms.forEach(function(room,index){
			$scope.tabs.push({title: room.name, id: room.id, maxPorts : room.maxPorts, ports: room.ports});
		});
	}

	$scope.togglePort = function(roomId,portId) {
		ioHome.togglePort(roomId,portId);
	}

	$scope.addNewPort =  function(roomId) {
		var roomName = ioHome.getRoomName(roomId);
		var availablePorts = ioHome.getAvailePorts(roomId);

    $mdDialog.show({
      controller: DialogController,
      templateUrl: "Client/app/views/addPort.html",
      parent: angular.element(document.body),
      targetEvent: null,
      clickOutsideToClose:true,
			locals : {
				data : {
	      	roomId: roomId,
					roomName : roomName,
					availablePorts : availablePorts,
				}
      }
    })
    .then(function(newPortInfo) {
      	ioHome.addNewPort(roomId,newPortInfo);
    }, function() {
      console.log('You cancelled the dialog.');
    });
  };

	$scope.editPort =  function(roomId,portId) {
		var roomName = ioHome.getRoomName(roomId);
		var availablePorts = ioHome.getAvailePorts(roomId);
		var portInfo = ioHome.getPortInfo(roomId,portId);

		$mdDialog.show({
			controller: DialogController,
			templateUrl: "Client\\app\\views\\editPort.html",
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			locals : {
				data : {
					roomId: roomId,
					roomName : roomName,
					availablePorts : availablePorts,
					portInfo : portInfo,
				}
			}
		})
		.then(function(result) {
			console.log(result);
			if(result.action === "delete") {
				ioHome.deletePort(roomId,result.portId);
			} else if(result.action === "save") {
				ioHome.updatePort(roomId,result);
			}
		}, function() {
			console.log('You cancelled the dialog.');
		});
	};

	function DialogController($scope, $mdDialog,data) {
		$scope.name = data.roomName;
		$scope.ports = data.availablePorts;
		if(data.portInfo) {
			$scope.portName = data.portInfo.name;
			$scope.portNo = data.portInfo.anchorPort;
			$scope.ports.push($scope.portNo);
			$scope.portId = data.portInfo.portId;
		}

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.save = function() {
			var result = {};
			result["action"] = "save";
			result["anchorPort"] = $scope.portNo;
			result["name"] = $scope.portName;
			result["status"] = false;
			$mdDialog.hide(result);
		};

		$scope.delete = function() {
			var result = {};
			result["action"] = "delete";
			result["portId"] = $scope.portId;
			$mdDialog.hide(result);
		}

		$scope.cancel = function() {
			$mdDialog.hide();
		}
	}

}]);
