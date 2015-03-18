'use strict';

angular.module('publicApp')
  .controller('UserloanstatusCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Loan, Repay) {
        headerService.saveHeader('user');

        $scope.shareData = Shareservice.getData();

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.kgcolumns = [
            {'field': 'LoanNo', 'title': '번호','width':'40px'},
            {'field': 'LoanType', 'title': '대출유형'},
            {'field': 'LoanDate', 'template': "#= kendo.toString(kendo.parseDate(LoanDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '대출일'},
            {'field': 'LoanExpDate', 'template': "#= kendo.toString(kendo.parseDate(LoanExpDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '만기일'},
            {'field': 'LoanPeriod', 'template': "#= kendo.toString(LoanPeriod)+'개월'#", 'title': '기간(월)' ,attributes:{style:"text-align:right;"}},
            {'field': 'LoanRate', 'template': "#= kendo.toString(LoanRate)+'%'#", 'title': '이자율(%)' ,attributes:{style:"text-align:right;"}},
            {'field': 'Principal', 'template': "#= kendo.toString(Principal, 'n0')#", 'title': '대출금액' ,attributes:{style:"text-align:right;"}},
            {'field': 'LoanUse', 'title': '용도'},
            {'field': 'RepaySum', 'template': "#= kendo.toString(RepaySum, 'n0')#", 'title': '상환액' ,attributes:{style:"text-align:right;"}},
            {'field': 'Balance', 'template': "#= kendo.toString(Balance, 'n0')#", 'title': '잔액' ,attributes:{style:"text-align:right;"}}
        ];

        $scope.reloadGrid = function (data) {
            console.log('data:' + data);
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            LoanNo: {type: "Number"},
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

        $scope.user = $scope.$parent.user;

        Loan.list({pid: $scope.user.Pid}, function success(callback) {
            //성공한 후 작업
            $scope.loanSum = callback[0].loanSum;
            $scope.repaySum = callback[0].repaySum;
            $scope.loanCnt = callback[0].data.length;
            $scope.reloadGrid(callback[0].data);
        }, function error() {
            console.log("Error: fund list")
        });
        //this will handle the event of selecting a row. I did this more for kicks so I could show I could do it.
        //when you select a row, the phone number is shown below, much like the official Kendo demos.
        $scope.rowSelected = function (e) {
            var grid = e.sender;
            var selectedRows = grid.select();
            for (var i = 0; i < selectedRows.length; i++) {
                $scope.selectedItem = grid.dataItem(selectedRows[i]);
                break;
            }
            //상환내역 갱신
            $scope.repayQuery();
        }
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};
        $scope.kgdatasourceDetail = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.kgcolumnsDetail = [
            {'field': 'RepayDate','template': "#= kendo.toString(kendo.parseDate(RepayDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '날짜'},
            {'field': 'RepayNo', 'title': '상환 납입 회차'},
            {'field': 'Payment', 'template': "#= kendo.toString(Payment, 'n0')#", 'title': '상환 납입금' ,attributes:{style:"text-align:right;"}},
            {'field': 'Interest', 'template': "#= kendo.toString(Interest, 'n0')#", 'title': '이자액' ,attributes:{style:"text-align:right;"}},
            {'field': 'RepaySum', 'template': "#= kendo.toString(RepaySum, 'n0')#", 'title': '상환누계' ,attributes:{style:"text-align:right;"}},
            {'field': 'RepayBalance', 'template': "#= kendo.toString(RepayBalance, 'n0')#", 'title': '상환잔액' ,attributes:{style:"text-align:right;"}}
        ];
        var reloadGridDetail = function (data) {
            console.log('data:' + data);
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            RepayDate: {type: "date"},
                            RepayNo: {type: "number"},
                            Payment: {type: "number"},
                            Interest: {type: "number"},
                            RepaySum: {type: "number"},
                            RepayBalance: {type: "number"}
                        }
                    }
                },
                pageSize: 20
            });
            d.read();
            $scope.kgdatasourceDetail.data(d.data());
        }
        $scope.rowSelectedDetail = function (e) {
            var grid = e.sender;
            var selectedRows = grid.select();
            for (var i = 0; i < selectedRows.length; i++) {
                $scope.selectedItemDetail = grid.dataItem(selectedRows[i]);
                break;
            }
        }

        $scope.repayQuery = function () {
            Repay.list({pid: $scope.user.Pid, loanid:$scope.selectedItem._id, fromdate:$scope.fromdate, todate:$scope.todate}, function success(callback) {
                //성공한 후 작업
                reloadGridDetail(callback.data);
                console.log(callback);
            }, function error() {
                console.log("Error: member add")
            });
        }
        //년도별조회
        $scope.yearRange = 0;

        $scope.$watch('yearRange', function (newVal, oldVal) {
            var num = Number(newVal);
            if (num==0) {
                $scope.todate = null;
                $scope.fromdate = null;
            } else {
                var fromdate = $scope.fromdate;
                var fromdate = new Date();
                fromdate.setFullYear(fromdate.getFullYear()-num);
                $scope.fromdate = fromdate;
                $scope.todate = new Date();
            }
        });
  });
