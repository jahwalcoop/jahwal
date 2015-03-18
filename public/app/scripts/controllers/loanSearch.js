'use strict';

angular.module('publicApp')
    .controller('LoanSearchCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Loan, Repay, Zone, Dashboard) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://docs.kendoui.com/getting-started/framework/globalization/numberformatting
        //http://www.kendoui.com/forums/kendo-ui-web/grid/right-align-currency-in-grid-cell.aspx
        $scope.kgcolumns = [
            {'field': 'Name', 'title': '이름'},
            {'field': 'LoanType', 'title': '대출유형'},
            {'field': 'LoanDate', 'template': "#= kendo.toString(kendo.parseDate(LoanDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '대출일'},
            {'field': 'LoanExpDate', 'template': "#= kendo.toString(kendo.parseDate(LoanExpDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '만기일'},
            {'field': 'LoanPeriod', 'template': "#= kendo.toString(LoanPeriod)+'개월'#", 'title': '기간(월)', attributes: {style: "text-align:right;"}},
            {'field': 'LoanRate', 'template': "#= kendo.toString(LoanRate)+'%'#", 'title': '이자율(%)', attributes: {style: "text-align:right;"}},
            {'field': 'Principal', 'template': "#= kendo.toString(Principal, 'n0')#", 'title': '대출금액', attributes: {style: "text-align:right;"}},
            {'field': 'LoanUse', 'title': '용도'},
            {'field': 'RepaySum', 'template': "#= kendo.toString(RepaySum, 'n0')#", 'title': '상환액', attributes: {style: "text-align:right;"}},
            {'field': 'Balance', 'template': "#= kendo.toString(Balance, 'n0')#", 'title': '잔액', attributes: {style: "text-align:right;"}}
        ];
        $scope.reloadGrid = function (data) {
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            Name: {type: "string"},
                            LoanType: {type: "string"},
                            LoanDate: {type: "date"},
                            LoanExpDate: {type: "date"},
                            LoanPeriod: {type: "string"},
                            LoanRate: {type: "number"},
                            Principal: {type: "number"},
                            LoanUse: {type: "string"},
                            RepaySum: {type: "number"},
                            Balance: {type: "number"}
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

        var loanQuery = function () {
            //선택한 지역에 따라 값을 가져옴
            Loan.list({pid: 'all', zone: $scope.zonecode, group: $scope.groupname, fromdate: $scope.fromdate, todate: $scope.todate}, function success(callback) {
                //성공한 후 작업
                console.log('zone:' + $scope.zonecode)
                var data = [];
                $scope.loanSum = 0;
                $scope.repaySum = 0;
                $scope.loanCnt = 0;
                for (var inx = 0; inx < callback.length; inx++) {
                    $scope.loanSum += callback[inx].loanSum;
                    $scope.repaySum += callback[inx].repaySum;
                    $scope.loanCnt += callback[inx].data.length;
                    for (var i = 0; i < callback[inx].data.length; i++) {
                        data.push(callback[inx].data[i]);
                    }
                }
                $scope.reloadGrid(data);
                // 선택한 지역에 따라 전체인지 지역인지가 달라짐.
                Dashboard.loan({zone: $scope.zonecode}, function success(callback) {
                    $scope.loanAll = callback.sum;
                });
                // 선택한 지역에 따라 전체인지 지역인지가 달라짐.
                Dashboard.repay({zone: $scope.zonecode}, function success(callback) {
                    $scope.repayAll = callback.sum;
                });
            }, function error() {
                console.log("Error: fund list")
            });
        }

        //loanQuery();

        $scope.submit = function () {
            loanQuery();
        };

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
