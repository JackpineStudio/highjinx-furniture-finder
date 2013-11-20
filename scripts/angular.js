function MyController($scope) {

	$scope.$watch('saleObjects', function() {
		$scope.array = [];
		$compSet = [];
		$count = 0;
		angular.forEach($scope.saleObjects, function(item) {
			if (($count % 3 == 0) && $count != 0) {
				$scope.array.push($compSet);
				$compSet = [];
			}
			$compSet.push(item);
			$count++;
		})
		
	});
	
}

