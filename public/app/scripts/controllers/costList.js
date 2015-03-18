'use strict';

angular.module('publicApp')
    .controller('CostlistCtrl', function ($scope, headerService, $location, $dialog, services) {
        headerService.saveHeader('admin');

        //////////////////////////////////////// 상단(세입) 그리드 ////////////////////////////////////////
        function dataClass(num) {
            this.No = num;
            this.Class1 = '';
            this.Class2 = '';
            this.Class3 = '';
            this.Class4 = '';
            this.Carryover = 0;
            this.Price = 0;
        }
        $scope.addInRow = function () {
            var data = new dataClass($scope.griddata.length + 1)
            $scope.griddata.push(data)
        }
        $scope.deleteInRow = function () {
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
                {field: 'Class1', displayName: '관', enableCellEdit: true},
                {field: 'Class2', displayName: '항', enableCellEdit: true},
                {field: 'Class3', displayName: '목', enableCellEdit: true},
                {field: 'Class4', displayName: '세목', enableCellEdit: true},
                {field: 'Carryover', displayName: '전기이월', enableCellEdit: true},
                {field: 'Price', displayName: '금액', enableCellEdit: true}
            ]
        };

        //////////////////////////////////////// 하단(세출)그리드 ////////////////////////////////////////
        $scope.addOutRow = function () {
            var data = new dataClass($scope.griddataout.length + 1)
            $scope.griddataout.push(data)
        }
        $scope.deleteOutRow = function () {
            //지우기
            for (var i = 0; i < $scope.griddataout.length; i++) {
                console.log($scope.griddataout[i].No);
                if ($scope.griddataout[i].No == $scope.mySelectionsOut[0].No) {
                    $scope.griddataout.splice(i,1)
                }
            }
            //번호메기기
            for (var i = 0; i < $scope.griddataout.length; i++) {
                $scope.griddataout[i].No = i+1;
            }
        }
        $scope.griddataout = [];
        $scope.mySelectionsOut = [];
        $scope.gridOptionsOut = {
            data: 'griddataout',
            selectedItems: $scope.mySelectionsOut,
            enableCellSelection: true,
            multiSelect: false,
            enableRowSelection: true,
            enableCellEdit: true,
            columnDefs: [
                {field: 'No', displayName: '순번', enableCellEdit: false},
                {field: 'Class1', displayName: '관', enableCellEdit: true},
                {field: 'Class2', displayName: '항', enableCellEdit: true},
                {field: 'Class3', displayName: '목', enableCellEdit: true},
                {field: 'Class4', displayName: '세목', enableCellEdit: true},
                {field: 'Carryover', displayName: '전기이월', enableCellEdit: true},
                {field: 'Price', displayName: '금액', enableCellEdit: true}
            ]
        };
        //프린트
        $scope.data = {}
        $scope.print = function () {
            $scope.data.indata = $scope.griddata;
            $scope.data.outdata = $scope.griddataout;
            $scope.data.business = $scope.business;
            $scope.data.moneytype = $scope.moneytype;
            services.setData($scope.data);
            console.log($scope.data.indata);
            $location.path('/printCostList')
        }
    });
