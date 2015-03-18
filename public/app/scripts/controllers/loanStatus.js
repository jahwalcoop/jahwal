'use strict';

angular.module('publicApp')
  .controller('LoanStatusCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Loan) {
        headerService.saveHeader('admin');

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름','width':'80px'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일','width':'100px'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일','width':'100px'},
            {'field': 'GroupName', 'title': '사업단'},
            {'field': 'Status', 'title': '상태','width':'75px'},
            {'field': 'Loan.length', 'title': '대출건수','width':'75px'},
            {'template': "<button class=\'k-button\' ng-click=\"showDetail('#= Pid #','#= Name #')\">조회하기</button>", 'title': '', 'width':'100px'}
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
                            Status: {type: "string"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        $scope.showDetail = function (Pid,Name) {
            Shareservice.setData({Pid:Pid,Name:Name});
            $location.path('/loanStatusDetail')
        }

        $scope.showModalLoan = function (id) {
            $scope.modalLoan.center().open();
        };
        $scope.modalLoanOk = function() {
            $scope.modalLoan.close();
        }
        $scope.modalLoanCancel = function() {
            $scope.modalLoan.close();
        }

        //조합원검색조건
        $scope.search = {selected:"name"};
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
            if($scope.search.selected != 'all') {
                cond[$scope.search.selected] = $scope.search.value;
            }
            $scope.memberstatus = status;
            if ($scope.memberstatus != 'all') {
                cond['status'] = $scope.memberstatus;
            }
            //loanlength : 대출내역이 몇개이상인것을 쿼리
            cond['loanlength'] = 1;
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
  });
