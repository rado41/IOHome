app.controller("homeCtrl",["$scope","$mdDialog","ioHomeService",
function($scope,$mdDialog,ioHome){

  $scope.dataready = ioHome.dataready;

	$scope.selectedIndex = 0;
  $scope.isOpen = false;
  $scope.selectedMode = 'md-fling';
	$scope.status = undefined;

	$scope.getTabs = function() {
		$scope.dataready = ioHome.dataready;
		if(ioHome.dataready) {
			return ioHome.tabs;
		}
	}

	$scope.togglePort = function(rId,pId,status) {
		ioHome.togglePort(rId,pId,status);
	}

	$scope.addNewPort =  function(rId) {
		var roomName = ioHome.getRoomName(rId);
		var availablePorts = ioHome.getAvailePorts(rId);

    $mdDialog.show({
      controller: DialogController,
      templateUrl: "Client/app/views/addPort.html",
      parent: angular.element(document.body),
      targetEvent: null,
      clickOutsideToClose:true,
			locals : {
				data : {
	      	rId: rId,
					roomName : roomName,
					availablePorts : availablePorts,
				}
      }
    })
    .then(function(result) {
			  console.log(result);
      	ioHome.addNewPort(rId,result.info);
    }, function() {
      console.log('You cancelled the dialog.');
    });
  };

	$scope.editPort =  function(rId,pId) {
		console.log(rId + ":" +  pId);
		var roomName = ioHome.getRoomName(rId);
		var availablePorts = ioHome.getAvailePorts(rId);
		var portInfo = ioHome.getPortInfo(rId,pId);

		$mdDialog.show({
			controller: DialogController,
			templateUrl: "Client\\app\\views\\editPort.html",
			parent: angular.element(document.body),
			targetEvent: null,
			clickOutsideToClose:true,
			locals : {
				data : {
					rId: rId,
					roomName : roomName,
					availablePorts : availablePorts,
					portInfo : portInfo,
				}
			}
		})
		.then(function(result) {
			console.log(result);
			if(result.action === "delete") {
				ioHome.deletePort(rId,result.info.pId);
			} else if(result.action === "save") {
				ioHome.updatePort(rId,result.info);
			}
		}, function() {
			console.log('You cancelled the dialog.');
		});
	};

	function DialogController($scope, $mdDialog,data) {
		$scope.name = data.roomName;
		$scope.ports = data.availablePorts;
    $scope.newPortNo;
		if(data.portInfo) {
			$scope.portName = data.portInfo.name;
			$scope.portNo = data.portInfo.anchorPort;
			$scope.ports.push($scope.portNo);
			$scope.pId = data.portInfo.pId;
			$scope.status = data.portInfo.status;
		}

		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};

		$scope.create = function() {
			var result = {};
			result["action"] = "create";
			result.info = {};
			result.info["anchorPort"] = parseInt($scope.portNo);
			result.info["name"] = $scope.portName;
			result.info["status"] = false;
			$mdDialog.hide(result);
		};

		$scope.save = function() {
			var result = {};
			result["action"] = "save";
			result.info = {};
			result.info["anchorPort"] = $scope.newPortNo;
			result.info["name"] = parseInt($scope.portName);
			result.info["status"] = $scope.status;
			result.info["pId"] = parseInt($scope.pId);
			$mdDialog.hide(result);
		};

		$scope.delete = function() {
			var result = {};
			result["action"] = "delete";
			result.info = {};
			result.info["pId"] = parseInt($scope.pId);
			$mdDialog.hide(result);
		}

		$scope.cancel = function() {
			$mdDialog.hide();
		}
	}

}]);
