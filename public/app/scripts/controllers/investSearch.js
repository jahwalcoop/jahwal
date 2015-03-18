'use strict';

angular.module('publicApp')
    .controller('InvestSearchCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, FundSummary, Zone, Dashboard) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.kgcolumns = [
            {'field': 'Name', 'title': '이름'},
            {'field': 'DepositDate', 'template': "#= kendo.toString(kendo.parseDate(DepositDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '출자 입금일'},
            {'field': 'Method', 'title': '출자방법'},
            {'field': 'Money', 'template': "#= kendo.toString(Money, 'n0')#", 'title': '출자액', attributes: {style: "text-align:right;"}},
            {'field': 'MoneySum', 'template': "#= kendo.toString(MoneySum, 'n0')#", 'title': '출자누계', attributes: {style: "text-align:right;"}},
            {'field': 'GroupName', 'title': '사업단'}
        ];

        var investQuery = function () {
            // 지역을 선택하면 그 지역이 표시됨
            FundSummary.all({zone: $scope.zonecode, groupname: $scope.groupname, fromdate: $scope.fromdate, todate: $scope.todate}, function success(callback) {
                //성공한 후 작업
                $scope.fundSum = 0;
                $scope.result = callback;
                for (var inx = 0; inx < callback.length; inx++) {
                    $scope.fundSum += callback[inx].Money;
                    $scope.fundSum -= callback[inx].ReduceMoney;
                }
                $scope.reloadGrid($scope.result);
                // 지역을 선택하면 그 지역이 표시됨
                Dashboard.fund({zone: $scope.zonecode}, function success(callback) {
                    $scope.fundAll = callback.sum;
                });
            }, function error() {
                console.log("Error: fund list")
            });
        }

        //investQuery();

        $scope.submit = function () {
            investQuery();
        }
//http://plnkr.co/edit/NnS3mk?p=info
        $scope.reloadGrid = function (data) {
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            Name: {type: "String"},
                            DepositDate: {type: "date"},
                            Method: {type: "string"},
                            Money: {type: "number"},
                            MoneySum: {type: "number"},
                            GroupName: {type: "string"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

//this will handle the event of selecting a row. I did this more for kicks so I could show I could do it.
//when you select a row, the phone number is shown below, much like the official Kendo demos.
        $scope.rowSelected = function (e) {
            var grid = e.sender;
            var selectedRows = grid.select();
            for (var i = 0; i < selectedRows.length; i++) {
                $scope.selectedItem = grid.dataItem(selectedRows[i]);
                break;
            }
        }

        //조회기간버튼
        $scope.tbutton = {
            label: '전체'
        }
        $scope.$watch('tbutton.active', function (newVal, oldVal) {
            if (newVal == true) {
                $scope.tbutton.label = '전체'
                $scope.fromdate = null;
                $scope.todate = null;
            } else {
                $scope.tbutton.label = '기간별'
            }
        }, true);
        //지역선택
        $scope.zonecode = null;
        $scope.groups = [];
        $scope.$on('zone_get_msg', function (event, data) {
            if (data.Scope == 'all') {
                Zone.list(function success(callback) {
                    //성공한 후 작업
                    callback.unshift({Code: 'all', Name: '전체'})
                    $scope.zones = callback;
                    $scope.zonecode = 'all';
                    $scope.disablezone = false;

                    console.log(callback);
                }, function error() {
                    console.log("Error: zone list")
                });
            } else {
                Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                    //성공한 후 작업
                    $scope.zones = [callback];
                    $scope.groups = callback.Group;
                    $scope.zonecode = callback.Code;
                    $scope.disablezone = true;

                    console.log($scope.groups);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        });

        $scope.$watch('zonecode', function (newVal, oldVal) {
            if (newVal) {
                Zone.get({code: newVal}, function success(callback) {
                    //성공한 후 작업
                    $scope.groups = callback.Group;

                    console.log(callback);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        }, true);
        //사업단 선택
        $scope.groupname = 'all';
    });