'use strict';

angular.module('publicApp')
    .controller('InvestStatusCtrl', function ($scope, headerService, $location, Shareservice, Search) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.$watch('kgdatasource', function (val) {
            var raw = $scope.kgdatasource.data();
            var length = raw.length;
            $scope.rowcnt = length;
        });
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'GroupName', 'title': '사업단'},
            {'field': 'Status', 'title': '상태'},
            {'field': 'FundCnt.invest', 'title': '증자', 'width': '50px'},
            {'field': 'FundCnt.reduce', 'title': '감자', 'width': '50px'},
            {'field': 'FundSum', 'template': "#= kendo.toString(FundSum, 'n0')#", 'title': '출자계', attributes: {style: "text-align:right;"}},
            {'template': "<button class=\'k-button\' ng-click=\"showInvestDetail('#= Pid #','#= Name #')\">출자현황조회</button>", 'title': '출자현황조회' }
        ];
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
                            },
                            FundSum: {type: "Number"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }
        $scope.showInvestDetail = function (Pid, Name) {
            Shareservice.setData({Pid: Pid, Name: Name, prevLocation: '/investStatus'});
            $location.path('/investStatusDetail')
        };
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};
        $scope.submit = function () {
            $route.reload();
            $scope.modalFundAdd.close();
        }
        $scope.cancel = function () {
            $route.reload();
            $scope.modalFundAdd.close();
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
        $scope.select2Options = {
            allowClear: true,
            minimumResultsForSearch: 99
        };
        $scope.btnClick = function () {
            $location.path('/investStatusDetail')
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
        $scope.memberstatus = 'all';
        $scope.fnsearch = function (status) {
            //검색조건을 만든다
            //zone조건
            var cond = {};
            cond['zone'] = $scope.$parent.user.ZoneCode;
            //검색폼 입력 결과
            if ($scope.search.selected != 'all') {
                cond[$scope.search.selected] = $scope.search.value;
            }
            $scope.memberstatus = status;
            if ($scope.memberstatus != 'all') {
                cond['status'] = $scope.memberstatus;
            }
            Search.memberlist(cond, function success(callback) {
                //성공한 후 작업
                var arr = [];
                for (var i = 0; i < callback.length; i++) {
                    var item = callback[i];
                    if (item.Fund.length != 0) {
                        arr.push(item);
                    }
                }
                $scope.memberCnt = arr.length;

                $scope.reloadGrid(arr);
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
    });
