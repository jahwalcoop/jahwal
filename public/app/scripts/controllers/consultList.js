'use strict';

angular.module('publicApp')
    .controller('ConsultlistCtrl', function ($scope, headerService, $location, $dialog, $window, services) {
        headerService.saveHeader('admin');

        $scope.data = [];
        function dataClass(num) {
            this.No = num;
            this.Account = '';
            this.Customer = '';
            this.Price = 0;
            this.Summary = 0;
            this.Source = '';
        }

        function detaildataClass(num) {
            this.No = num;
            this.Item = '';
            this.Standard = '';
            this.Amount = 0;
            this.Unit = 0;
            this.Cost = 0;
            this.Price = 0;
            this.Class = '';
            this.Note = '';
        }

        //////////////////////////////////////// 상단 그리드 ////////////////////////////////////////
        $scope.addRow = function () {
            var data = new dataClass($scope.data.length + 1)
            $scope.data.push(data)
        }
        $scope.deleteRow = function () {
            //지우기
            for (var i = 0; i < $scope.data.length; i++) {
                console.log($scope.data[i].No);
                if ($scope.data[i].No == $scope.mySelections[0].No) {
                    $scope.data.splice(i,1)
                }
            }
            //번호메기기
            for (var i = 0; i < $scope.data.length; i++) {
                $scope.data[i].No = i+1;
            }
        }
        $scope.data = [];
        $scope.mySelections = [];
        $scope.gridOptions = {
            data: 'data',
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
                {field: 'Summary', displayName: '적요', enableCellEdit: true},
                {field: 'Source', displayName: '자금원천', enableCellEdit: true}
            ]
        };
        //////////////////////////////////////// 하단 그리드 ////////////////////////////////////////
        $scope.addDetailRow = function () {
            var data = new detaildataClass($scope.detaildata.length + 1)
            $scope.detaildata.push(data)
        }
        $scope.deleteDetailRow = function () {
            //지우기
            for (var i = 0; i < $scope.detaildata.length; i++) {
                console.log($scope.detaildata[i].No);
                if ($scope.detaildata[i].No == $scope.mySelectionsDetail[0].No) {
                    $scope.detaildata.splice(i,1)
                }
            }
            //번호메기기
            for (var i = 0; i < $scope.detaildata.length; i++) {
                $scope.detaildata[i].No = i+1;
            }
        }
        $scope.detaildata = [];
        $scope.mySelectionsDetail = [];
        $scope.gridOptionsDetail = {
            data: 'detaildata',
            selectedItems: $scope.mySelectionsDetail,
            enableCellSelection: true,
            multiSelect: false,
            enableRowSelection: true,
            enableCellEdit: true,
            columnDefs: [
                {field: 'No', displayName: '순번', enableCellEdit: false},
                {field: 'Item', displayName: '품목', enableCellEdit: true},
                {field: 'Standard', displayName: '규격', enableCellEdit: true},
                {field: 'Amount', displayName: '단위', enableCellEdit: true},
                {field: 'Unit', displayName: '수량', enableCellEdit: true},
                {field: 'Cost', displayName: '단가', enableCellEdit: true},
                {field: 'Price', displayName: '금액', enableCellEdit: true},
                {field: 'Class', displayName: '물품구분', enableCellEdit: true},
                {field: 'Note', displayName: '비고', enableCellEdit: true}
            ]
        };
        //프린트
        $scope.print = function () {
            var data = {
                consultDate: $scope.consultDate,
                deliDate: $scope.deliDate,
                business: $scope.business,
                note: $scope.note,
                data: $scope.data,
                datasum:0,
                detaildata: $scope.detaildata,
                detailsum1:0,
                detailsum2:0,
                detailsum3:0
            };
            for(var i=0; i < $scope.data.length; i++) {
                 data.datasum += Number($scope.data[i].Price)
            }
            for(var i=0; i < $scope.detaildata.length; i++) {
                data.detailsum1 += Number($scope.detaildata[i].Unit)
                data.detailsum2 += Number($scope.detaildata[i].Cost)
                data.detailsum3 += Number($scope.detaildata[i].Price)
            }

            services.setData(data);
            $location.path('/printConsultList')
        }
    });
