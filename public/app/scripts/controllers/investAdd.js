'use strict';

angular.module('publicApp')
    .controller('InvestAddCtrl', function ($scope, headerService, Shareservice, $location, $route, Member, Fund, Search, Zone) {
        headerService.saveHeader('admin');

        $scope.fundDialog = {url: 'views/include/investForm.html', type: 'add', data: {}, fund: {}};

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
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
            {'field': 'Status', 'title': '상태'},
            {'field': 'FundCnt.invest', 'title': '증자', 'width': '50px'},
            {'field': 'FundCnt.reduce', 'title': '감자', 'width': '50px'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-plus\' ng-click=\"showInvestAdd('#= Pid #','#= '증자' #')\"></i></button>", 'title': '증자', 'width': '50px'});
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-minus\' ng-click=\"showInvestAdd('#= Pid #','#= '감자' #')\"></i></button>", 'title': '감자', 'width': '50px'});
        }
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
                            Status: {type: "string"},
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


        $scope.member = {};
        $scope.showInvestAdd = function (Pid, fundType) {
            var raw = $scope.kgdatasource.data();
            var length = raw.length;
            var item, i;
            for (i = length - 1; i >= 0; i--) {
                item = raw[i];
                if (item.Pid === Pid) {
                    $scope.Name = item.Name;
                    $scope.Pid = item.Pid;
                }
            }
            //선택한 멤버에 대한 데이터를 가져온다.
            Member.query({pid: Pid}, function success(callback) {
                //성공한 후 작업
                $scope.member = callback[0];
                console.log($scope.member);
                $scope.fundDialog.data.Name = $scope.member.Name;
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
            }, function error() {
                console.log("Error: member add")
            });
        };
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};
        $scope.fundDialog.fund = {
            ZoneName: ""
        }
        $scope.fundSubmit = function (type) {
            //Fund를 넣는다.
            $scope.fundDialog.fund.ZoneName = $scope.member.ZoneName;
            console.log($scope.member);

            Fund.save({pid: $scope.member.Pid}, $scope.fundDialog.fund, function success(callback) {
                $scope.fnsearch();
                console.log("fund save");
            }, function error() {
                console.log("Error: fund save");
            });
            $scope.fundDialog.dialog.close();
        }

        $scope.fundCancel = function () {
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
        $scope.select2Opts = {
            allowClear: true,
            minimumResultsForSearch: 99
        };
        $scope.addBtnClick = function () {
            $location.path('/investAddDetail');
        }

        //조합원검색조건
        $scope.search = {selected: "name"};
        $scope.searchTypeText = true;
        $scope.$watch('search.selected', function (val) {
            if ($scope.search.selected == 'regdate') {
                $scope.searchTypeText = false;
            } else {
                $scope.searchTypeText = true;
            }
            $scope.search.value = '';
        });
        //검색하기
        $scope.fnsearch = function () {
            //검색조건을 만든다
            //zone조건
            var cond = {};
            cond['zone'] = $scope.$parent.user.ZoneCode;
            //검색폼 입력 결과
            if ($scope.search.selected != 'all') {
                cond[$scope.search.selected] = $scope.search.value;
            }
            console.log(cond);
            Search.memberlist(cond, function success(callback) {
                //성공한 후 작업
                $scope.memberCnt = callback.length;
                $scope.reloadGrid(callback);
            }, function error() {
                console.log("Error: fund list")
            });
        }
        //검색조건
        $scope.searchparams = [
            {value: 'name', text: '이름'},
            {value: 'pid', text: '고유번호'},
            {value: 'regdate', text: '가입일'},
            {value: 'zonename', text: '사업단명'}
        ];

        //dialog의 사업단 정보를 가져오기위한 코드
        $scope.$on('zone_get_msg', function (event, data) {
            Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                $scope.groups = callback.Group;
                $scope.groups.unshift('');
            });
        })
    });
