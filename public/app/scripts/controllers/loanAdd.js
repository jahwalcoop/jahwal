'use strict';

angular.module('publicApp')
    .controller('LoanAddCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Loan) {
        headerService.saveHeader('admin');

        $scope.loanDialog = {url: 'views/include/loanForm.html', type: 'add', data: {}, loan: {}};

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'GroupName', 'title': '사업단'},
            {'field': 'Status', 'title': '상태'},
            {'field': 'Loan.length', 'title': '대출건수', 'width': '75px'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"showModalLoan('#= Pid #','#= Name #')\">기입하기</button>", 'title': '' });
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
                            Status: {type: "string"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        $scope.showModalLoan = function (Pid, Name) {
//            루프돌며 찾기
//            var raw = $scope.kgdatasource.data();
//            var length = raw.length;
//            var item, i;
//            console.log(Pid);
//            for (i = length - 1; i >= 0; i--) {
//                item = raw[i];
//                if (item.Pid === Pid) {
//                    $scope.Name = item.Name;
//                }
//            }
            $scope.loanDialog.data.Pid = Pid;
            $scope.loanDialog.data.Name = Name;
            Member.query({pid: Pid}, function success(callback) {
                //성공한 후 작업
                $scope.member = callback[0];
                console.log($scope.member);
                $scope.loanDialog.loan.LoanGroupName = callback[0].GroupName;
                $scope.loanDialog.dialog.center().open();
            }, function error() {
                console.log("Error: member add")
            });
        };
        $scope.loanSubmit = function (type) {
            //Loan을 넣는다.
            console.log($scope.loanDialog.loan);
            console.log(typeof $scope.loanDialog.loan.LoanPeriodNum)
            Loan.save({pid: $scope.member.Pid}, $scope.loanDialog.loan, function success(callback) {
                $scope.fnsearch();
                console.log("Loan save");
            }, function error() {
                console.log("Error: Loan save");
            });
            $scope.loanDialog.dialog.close();
        }

        $scope.loanCancel = function () {
            $scope.loanDialog.dialog.close();
        }
        $scope.$on('zone_get_msg', function (event, data) {
            // 드롭다운리스트 : 대출유형
            $scope.loanTypes = $scope.$parent.zone.LoanTypes;
            // 드롭다운리스트 : 대출용도
            $scope.loanUses = $scope.$parent.zone.LoanUses;
        });
        $scope.loanDialog.loan.LoanDate = new Date();
        // 인풋 : 대출기간
        var calcLoanPeriod = function (loandate, month) {
            var loandate = new Date(loandate.toISOString());
            loandate.setMonth(loandate.getMonth() + parseInt(month));
            return loandate;
        }
        $scope.$watch('loanDialog.loan.LoanPeriod', function (newVal, oldVal) {
            if (newVal) {
                var date = calcLoanPeriod($scope.loanDialog.loan.LoanDate, $scope.loanDialog.loan.LoanPeriod);
                $scope.loanDialog.loan.LoanExpDate = new Date(date);
            }
        });
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
    });
