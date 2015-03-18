'use strict';

angular.module('publicApp')
    .controller('DisburselistCtrl', function ($scope, headerService, $location, $dialog, services) {
        headerService.saveHeader('admin');

        function dataClass(num) {
            this.No = num;
            this.Accunt = '';
            this.Customer = '';
            this.Price = 0;
            this.Source = '';
            this.Contra = '';
        }
        $scope.addRow = function () {
            var data = new dataClass($scope.griddata.length + 1)
            $scope.griddata.push(data)
        }
        $scope.deleteRow = function () {
            //지우기
            for (var i = 0; i < $scope.griddata.length; i++) {
                console.log($scope.griddata[i].No);
                if ($scope.griddata[i].No == $scope.mySelections[0].No) {
                    $scope.griddata.splice(i,1)
                }
            }
            //번호메기기
            for (var i = 0; i < $scope.griddata.length; i++) {
                $scope.griddata[i].No = i+1;
            }
        }
        $scope.griddata = [];
        $scope.mySelections = [];
        $scope.gridOptions = {
            data: 'griddata',
            selectedItems: $scope.mySelections,
            enableCellSelection: true,
            multiSelect: false,
            enableRowSelection: true,
            enableCellEdit: true,
            columnDefs: [
                {field: 'No', displayName: '순번', enableCellEdit: false},
                {field: 'Account', displayName: '계정', enableCellEdit: true},
                {field: 'Customer', displayName: '거래처', enableCellEdit: true},
                {field: 'Price', displayName: '금액', enableCellEdit: true},
                {field: 'Contra', displayName: '자금원천', enableCellEdit: true},
                {field: 'Source', displayName: '상대계정', enableCellEdit: true}
            ]
        };
        //프린트
        $scope.print = function () {
            for (var i = 0; i < $scope.griddata.length; i++) {
                $scope.data.datasum += $scope.griddata[i].Price
            }
            $scope.data.griddata = $scope.griddata;

            services.setData($scope.data);
            $location.path('/printDisburseList')
        }
    });
