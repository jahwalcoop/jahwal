'use strict';

angular.module('publicApp')
  .controller('UserinveststatusCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, FundSummary, Zone) {
        headerService.saveHeader('user');

        $scope.shareData = Shareservice.getData();

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });

        $scope.kgcolumns = [
            {'field': 'DepositNum', 'title': '출자 횟수'},
            {'field': 'DepositDate', 'template': "#= kendo.toString(kendo.parseDate(DepositDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '출자 입금일'},
            {'field': 'Method', 'title': '출자방법'},
            {'field': 'Money', 'template': "#= kendo.toString(Money, 'n0')#", 'title': '출자액' ,attributes:{style:"text-align:right;"}},
            {'field': 'MoneySum', 'template': "#= kendo.toString(MoneySum, 'n0')#", 'title': '출자누계' ,attributes:{style:"text-align:right;"}},
            {'field': 'ZoneName', 'title': '지역-사업단'}
        ];

        $scope.user = $scope.$parent.user;

        $scope.search = function () {
            //총계
            FundSummary.list({pid: $scope.user.Pid, fromdate:$scope.fromdate, todate:$scope.todate}, function success(callback) {
                //성공한 후 작업
                $scope.result = callback;
                console.log(callback);
                $scope.sum = $scope.result.sum;
                $scope.reloadGrid($scope.result.data);
                //누계
                FundSummary.sum({pid: $scope.user.Pid}, function success(result) {
                    console.log(result);
                    $scope.sumall = result.MoneySumAll;
                }, function error() {
                    console.log("Error: fund list")
                });
                //좌수
                Zone.moneycut({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                    $scope.moneycut = callback.MoneyCut;
                    $scope.units = $scope.sum /  callback.MoneyCut;
                })
            }, function error() {
                console.log("Error: fund list")
            });
        }

        //http://plnkr.co/edit/NnS3mk?p=info
        $scope.reloadGrid = function(data) {
            console.log('reloadGridData');
            console.log(data);
            var d = new kendo.data.DataSource({
                data:data,
                schema: {
                    model: {
                        fields: {
                            DepositNum: {type: "number"},
                            DepositDate: {type: "date"},
                            Method: {type: "string"},
                            Money: {type: "number"},
                            MoneySum: {type: "number"},
                            ZoneName: {type: "string"}
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
