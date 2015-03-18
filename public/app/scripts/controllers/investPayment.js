'use strict';

angular.module('publicApp')
    .controller('InvestpaymentCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, FundSummary, Zone, Summary) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'GroupName', 'title': '사업단'},
            {'field': 'FundStatus', 'title': '납부상태'},
            {'field': 'FundCnt.invest', 'title': '증자', 'width': '50px'},
            {'field': 'FundCnt.reduce', 'title': '감자', 'width': '50px'},
            {'template': "<button class=\'k-button\' ng-click=\"showInvestDetail('#= Pid #','#= Name #')\">출자현황조회</button>", 'title': '출자현황조회' }
        ];

        var investQuery = function () {
            Summary.fund({zone: $scope.zonecode, group: $scope.groupname, fromdate: $scope.fromdate, todate: $scope.todate, status: '활동중'}, function success(callback) {
                // 활동중인 사용자를 가져옴
                console.log('success fund summary');
                $scope.count = callback.count;
                $scope.payment = callback.payment;
                $scope.default = callback.default;
                console.log(callback)
                $scope.list = callback.list;
                $scope.reloadGrid(callback.list);
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
                            Pid: {type: "string"},
                            Name: {type: "string"},
                            Birthday: {type: "date"},
                            RegDate: {type: "date"},
                            GroupName: {type: "string"},
                            FundStatus: {type: "string"},
                            FundCnt: {
                                invest: {type: "Number"},
                                reduce: {type: "Number"}
                            }
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
        $scope.showInvestDetail = function (Pid,Name) {
            Shareservice.setData({Pid:Pid,Name:Name,prevLocation:'/investStatus'});
            $location.path('/investStatusDetail')
        };
        //조회기간버튼
        $scope.tbutton = {
            label: '전체'
        }
        var calMonth = function(month) {
            $scope.todate = new Date();
            var date = new Date();
            date.setMonth(date.getMonth() - month);
            $scope.fromdate = date;
        }
        //지역선택
        $scope.zonecode = null;
        $scope.groups = [];
        $scope.$on('zone_get_msg', function (event, data) {
            $scope.defaultmonth = data.DefaultMonth;
            calMonth(data.DefaultMonth);
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
            if (newVal != 'all') {
                Zone.get({code: newVal}, function success(callback) {
                    //성공한 후 작업
                    $scope.groups = callback.Group;
                    $scope.defaultmonth = callback.DefaultMonth;
                    calMonth(callback.DefaultMonth);
                    console.log(callback);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        }, true);
        //사업단 선택
        $scope.groupname = 'all';

        $scope.rebindgrid = function(fundstatus) {
            var list = $scope.list;
            var itemArr = [];
            for(var i=0; i < list.length; i++) {
                var item = list[i];
                if(item.FundStatus == fundstatus || fundstatus == 'all') {
                    itemArr.push(item);
                }
            }
            $scope.reloadGrid(itemArr);
        }
    });