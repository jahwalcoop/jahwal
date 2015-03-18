'use strict';

angular.module('publicApp')
    .controller('InvestStatusDetailCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, FundSummary, Zone, Fund, services, $window) {
        headerService.saveHeader('admin');

        $scope.fundDialog = {url: 'views/include/investForm.html', type: 'add', data: {}, fund: {}};

        $scope.shareData = Shareservice.getData();

        $scope.kgpageable = { 'refresh': false, 'pageSizes': false };
        $scope.kgdatasource = new kendo.data.DataSource({pageSize: 15});

        $scope.kgcolumns = [
            {'field': 'DepositNum', 'title': '출자 횟수'},
            {'field': 'DepositDate', 'template': "#= kendo.toString(kendo.parseDate(DepositDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '출자 입금일'},
            {'field': 'Method', 'title': '출자방법'},
            {'field': 'Money', 'template': "#= kendo.toString(Money, 'n0')#", 'title': '출자액', attributes: {style: "text-align:right;"}},
            {'field': 'ReduceMoney', 'template': "#= kendo.toString(ReduceMoney, 'n0')#", 'title': '감자액', attributes: {style: "text-align:right;"}},
            {'field': 'MoneySum', 'template': "#= kendo.toString(MoneySum, 'n0')#", 'title': '출자누계', attributes: {style: "text-align:right;"}},
            {'field': 'GroupName', 'title': '사업단'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-edit\' ng-click=\"fundItemClick('#= _id #','#= Method #','#= 'update' #')\"></i></button>", 'title': '', 'width': '50px'});
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-remove\' ng-click=\"fundItemClick('#= _id #','#= Method #','#= 'delete' #')\"></i></button>", 'title': '', 'width': '50px'});
        }
        var investQuery = function () {
            //총계
            FundSummary.list({pid: $scope.shareData.Pid, fromdate: $scope.fromdate, todate: $scope.todate}, function success(callback) {
                //성공한 후 작업
                console.log(callback);
                $scope.result = callback;
                $scope.sum = $scope.result.sum;
                $scope.reloadGrid(callback.data);
                //누계
                FundSummary.sum({pid: $scope.shareData.Pid}, function success(result) {
                    $scope.sumall = result.MoneySumAll;
                }, function error() {
                    console.log("Error: fund list")
                });
                //좌수
                Zone.moneycut({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                    $scope.moneycut = callback.MoneyCut;
                    $scope.units = $scope.sum / callback.MoneyCut;
                })
            }, function error() {
                console.log("Error: fund list")
            });
        }
        investQuery();
        //http://plnkr.co/edit/NnS3mk?p=info
        $scope.reloadGrid = function (data) {
            console.log('reloadGridData');
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            DepositNum: {type: "number"},
                            DepositDate: {type: "date"},
                            Method: {type: "string"},
                            Money: {type: "number"},
                            ReduceMoney: {type: "number"},
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

        //년도별조회
        $scope.yearRange = 0;
        $scope.$watch('yearRange', function (newVal, oldVal) {
            var num = Number(newVal);
            if (num == 0) {
                $scope.todate = null;
                $scope.fromdate = null;
            } else {
                var fromdate = new Date();
                fromdate.setFullYear(fromdate.getFullYear() - num);
                $scope.fromdate = fromdate;
                $scope.todate = new Date();
            }
        });

        //////////////////////////////////////// Fund 수정,삭제 ////////////////////////////////////////
        //그리드 데이터 가져오기
        var findFundGridData = function (id) {
            // 루프돌며 찾기
            var raw = $scope.kgdatasource.data();
            var length = raw.length;
            var item, i;
            for (i = length - 1; i >= 0; i--) {
                item = raw[i];
                if (item._id === id) {
                    return item;
                }
            }
        }
        //그리드 버튼이벤트
        $scope.fundItemClick = function (id, method, type) {
            $scope.fundDialog.fund = findFundGridData(id);
            $scope.fundDialog.type = type;

            if (method == '반환금') {
                $scope.fundDialog.data.fundType = '감자';
            } else {
                $scope.fundDialog.data.fundType = '증자';
            }
            $scope.fundDialog.dialog.center().open();

        }
        //출자,감자버튼 이벤트
        $scope.showInvestAdd = function (fundType) {
            $scope.fundDialog.type = 'add';
            $scope.fundDialog.data.Name = $scope.shareData.Name;
            $scope.fundDialog.data.fundType = fundType;
            $scope.fundDialog.fund.GroupName = $scope.member.GroupName;

            if (fundType == '증자') {
                $scope.fundDialog.fund.Method = $scope.member.FundingMethod;
                $scope.fundDialog.fund.ReduceMoney = 0;
            } else if(fundType == '감자') {
                $scope.fundDialog.fund.Method = '반환금';
                $scope.fundDialog.fund.Money = 0;
            } else {
                console.log('fund type error');
            }

            $scope.fundDialog.dialog.center().open();
        };
        //////////////////////////////////////// 출자 다이얼로그
        $scope.member = {};
        Member.query({pid: $scope.shareData.Pid}, function success(callback) {
            $scope.member = callback[0];
        }, function error() {
            console.log("Error: member get")
        });
        $scope.fundSubmit = function (type) {
            console.log(type);
            $scope.fundDialog.fund.ZoneName = $scope.member.ZoneName;
            if (type == 'add') {
                Fund.save({pid: $scope.member.Pid}, $scope.fundDialog.fund, function success(callback) {
                    console.log("fund save");
                    investQuery();
                }, function error() {
                    console.log("Error: fund save");
                });
            }
            if (type == 'update') {
                Fund.update({pid: $scope.shareData.Pid, fundid: $scope.fundDialog.fund._id}, $scope.fundDialog.fund, function success(callback) {
                    console.log("fund update");
                    investQuery();
                }, function error() {
                    console.log("Error: fund update");
                });
            }
            if (type == 'delete') {
                Fund.delete({pid: $scope.shareData.Pid, fundid: $scope.fundDialog.fund._id}, function success(callback) {
                    console.log("fund delete");
                    investQuery();
                }, function error() {
                    console.log("Error: fund delete");
                });
            }
            $scope.fundDialog.dialog.close();
        }

        $scope.fundCancel = function () {
            investQuery();
            $scope.fundDialog.dialog.close();
        }

        $scope.$watch('fundDialog.fund.Method', function (newVal, oldVal) {
            if (newVal) {
                if (newVal == $scope.member.FundingMethod) {
                    $scope.warn = "";
                } else if (newVal != '반환금') {
                    $scope.warn = $scope.member.FundingMethod + "로 설정된 사용자 입니다"
                }
            }
        });

        //dialog의 사업단 정보를 가져오기위한 코드
        $scope.$on('zone_get_msg', function (event, data) {
            Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                $scope.groups = callback.Group;
                $scope.groups.unshift('');
            });
        })

        $scope.print = function () {
            services.setData({Pid:$scope.member.Pid,Name:$scope.member.Name,data:$scope.result.data});
            $location.path('/printInvestStatus')
        }

        //파일다운로드
        $scope.saveFile = function () {
            var query = '&fromdate='+$scope.fromdate+'&todate='+$scope.todate;
            $window.location = '/api/fund/list/' + $scope.shareData.Pid + '?exportfile=1'+query;
        }
    });
