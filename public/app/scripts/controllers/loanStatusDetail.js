'use strict';

angular.module('publicApp')
  .controller('LoanstatusdetailCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, Search, Loan, Repay, $window) {
        headerService.saveHeader('admin');

        $scope.loanDialog = {url:'views/include/loanForm.html',type:'update',data:{},loan:{}}; //add,update,delete
        $scope.repayDialog = {url:'views/include/repayForm.html',type:'add',data:{},repay:{}}; //add,update,delete
        $scope.warnDialog = {url:'views/include/warnForm.html',message:''}; //add,update,delete

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
            {'field': 'LoanGroupName', 'title': '사업단'},
            {'field': 'RepaySum', 'template': "#= kendo.toString(RepaySum, 'n0')#", 'title': '상환액' ,attributes:{style:"text-align:right;"}},
            {'field': 'Balance', 'template': "#= kendo.toString(Balance, 'n0')#", 'title': '잔액' ,attributes:{style:"text-align:right;"}}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-edit\' ng-click=\"loanUpdateClick('#=_id#')\"></i></button>", 'title': '', 'width':'50px'});
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-remove\' ng-click=\"loanDeleteClick('#=_id#')\"></i></button>", 'title': '', 'width':'50px'});
        }
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
                            LoanPeriod: {type: "number"},
                            LoanRate: {type: "number"},
                            Principal: {type: "number"},
                            LoanUse: {type: "string"},
                            LoanGroupName: {type: "string"},
                            RepaySum: {type: "number"},
                            Balance: {type: "number"}
                        }
                    }
                },
                pageSize: 20
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        $scope.loanCnt = 0;
        $scope.loanSum = 0;
        $scope.repaySum = 0;
        $scope.status = 'all';
        $scope.loanQuery = function() {
            Loan.list({pid: $scope.shareData.Pid,status:$scope.status}, function success(callback) {
                //성공한 후 작업
                $scope.loanSum = callback[0].loanSum;
                $scope.repaySum = callback[0].repaySum;
                $scope.loanCnt = callback[0].data.length;

                $scope.reloadGrid(callback[0].data);
            }, function error() {
                console.log("Error: fund list")
            });
        }
        $scope.loanQuery();
        $scope.$watch('status', function (newVal, oldVal) {
            if (newVal) {
                $scope.loanQuery();
                reloadGridDetail([]);
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
            //다이얼로그에 뿌려지는 대출 정보
            $scope.repayDialog.data.LoanNo = $scope.selectedItem.LoanNo;
            $scope.repayDialog.data.LoanType = $scope.selectedItem.LoanType;
            $scope.repayDialog.data.LoanDate = $scope.selectedItem.LoanDate;
            //상환내역 갱신
            $scope.repayQuery();
        }
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};
        $scope.kgdatasourceDetail = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        $scope.kgcolumnsDetail = [
            {'field': 'RepayDate','template': "#= kendo.toString(kendo.parseDate(RepayDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '날짜'},
            {'field': 'RepayGroupName', 'title': '사업단'},
            {'field': 'RepayNo', 'title': '상환 납입 회차'},
            {'field': 'Payment', 'template': "#= kendo.toString(Payment, 'n0')#", 'title': '상환 납입금' ,attributes:{style:"text-align:right;"}},
            {'field': 'Interest', 'template': "#= kendo.toString(Interest, 'n0')#", 'title': '이자액' ,attributes:{style:"text-align:right;"}},
            {'field': 'RepaySum', 'template': "#= kendo.toString(RepaySum, 'n0')#", 'title': '상환누계' ,attributes:{style:"text-align:right;"}},
            {'field': 'RepayBalance', 'template': "#= kendo.toString(RepayBalance, 'n0')#", 'title': '상환잔액' ,attributes:{style:"text-align:right;"}}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumnsDetail.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-edit\' ng-click=\"repayUpdateClick('#=_id#')\"></i></button>", 'title': '', 'width':'50px' });
            $scope.kgcolumnsDetail.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-remove\' ng-click=\"repayDeleteClick('#=_id#')\"></i></button>", 'title': '', 'width':'50px' });
        }
        var reloadGridDetail = function (data) {
            console.log('data:' + data);
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            RepayDate: {type: "date"},
                            RepayGroupName: {type: "string"},
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

        /* Loan,Repay Modal창에 대하여
         * 한 화면에서 동일한 모달창이 동작해야 하므로 함수에 타입을 넘겨 동작을 분기시킨다.
         * repaySubmit(repayDialog.type), loanSubmit(loanDialog.type)
         *
         * 모달창을 띄우기전에 모달창의 동작타입을 지정해야 한다.
         * repayDialog.type = 'add'; //add,update,delete중 하나 지정
         */

        //////////////////////////////////////// Loan 수정,삭제 ////////////////////////////////////////
        $scope.loanDialog.data.Pid = $scope.shareData.Pid;
        $scope.loanDialog.data.Name = $scope.shareData.Name;
        $scope.loanDialog.loan = {};
        // 드롭다운리스트 : 대출유형
        $scope.loanTypes = $scope.$parent.zone.LoanTypes;
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
        // 드롭다운리스트 : 대출용도
        $scope.loanUses = $scope.$parent.zone.LoanUses;
        var findLoanGridData = function(id) {
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
        $scope.loanUpdateClick = function(id) {
            $scope.loanDialog.loan = findLoanGridData(id);
            $scope.loanDialog.type = 'update';
            $scope.loanDialog.dialog.center().open();
        }
        $scope.loanDeleteClick = function(id) {
            $scope.loanDialog.loan = findLoanGridData(id);
            $scope.loanDialog.type = 'delete';
            $scope.loanDialog.dialog.center().open();
        }
        //다이얼로그 버튼이벤트
        $scope.loanCancel = function () {
            $scope.loanDialog.dialog.close();
        }
        $scope.loanSubmit = function(type) {
            if (type=='add') {

            }
            if (type=='update') {
                console.log($scope.loanDialog.loan);
                Loan.update({pid: $scope.shareData.Pid,loanid:$scope.loanDialog.loan._id}, $scope.loanDialog.loan, function success(callback) {
                    console.log("loan update");
                    //그리드 갱신
                    $scope.loanQuery();
                    $scope.repayQuery();
                }, function error() {
                    console.log("Error: loan update");
                });
            }
            if (type=='delete') {
                Loan.delete({pid: $scope.shareData.Pid,loanid:$scope.loanDialog.loan._id}, function success(callback) {
                    console.log("loan delete");
                    //그리드 갱신
                    $scope.loanQuery();
                    reloadGridDetail([]);
                }, function error() {
                    console.log("Error: loan delete");
                });
            }

            $scope.loanDialog.dialog.close();
        }
        //////////////////////////////////////// Repay 추가,수정,삭제 ////////////////////////////////////////
        $scope.repayQuery = function () {
            Repay.list({pid: $scope.shareData.Pid, loanid:$scope.selectedItem._id, fromdate:$scope.fromdate, todate:$scope.todate}, function success(callback) {
                //성공한 후 작업
                reloadGridDetail(callback.data);
                console.log(callback);
            }, function error() {
                console.log("Error: member add")
            });
        }
        $scope.repayDialog.repay.RepayDate = new Date();
        $scope.onRepayClick = function() {
            if ($scope.selectedItem) {
                $scope.repayDialog.type = 'add';
                $scope.repayDialog.dialog.center().open();
            } else {
                $scope.warnDialog.message = "대출내역을 선택해주세요"
                $scope.warnDialog.dialog.center().open();
            }
        }
        var findLoanGridDetailData = function(id) {
            // 루프돌며 찾기
            var raw = $scope.kgdatasourceDetail.data();
            var length = raw.length;
            var item, i;
            for (i = length - 1; i >= 0; i--) {
                item = raw[i];
                if (item._id === id) {
                    return item;
                }
            }
        }
        //그리드 버튼 이벤트
        $scope.repayUpdateClick = function(id) {
            $scope.repayDialog.repay = findLoanGridDetailData(id);
            $scope.repayDialog.type = 'update';
            $scope.repayDialog.dialog.center().open();
        }
        $scope.repayDeleteClick = function(id) {
            $scope.repayDialog.repay = findLoanGridDetailData(id);
            $scope.repayDialog.type = 'delete';
            $scope.repayDialog.dialog.center().open();
        }
        $scope.repaySubmit = function(type) {
            if (type=='add') {
                Repay.save({pid: $scope.shareData.Pid, loanid:$scope.selectedItem._id}, $scope.repayDialog.repay, function success(callback) {
                    //성공한 후 작업
                    console.log(callback);
                    //그리드 갱신
                    $scope.loanQuery();
                    $scope.repayQuery();
                }, function error() {
                    console.log("Error: member add")
                });
            }
            if (type=='update') {
                Repay.update({pid: $scope.shareData.Pid, loanid:$scope.selectedItem._id, repayid:$scope.repayDialog.repay._id}, $scope.repayDialog.repay, function success(callback) {
                    //성공한 후 작업
                    console.log(callback);
                    //그리드 갱신
                    $scope.loanQuery();
                    $scope.repayQuery();
                }, function error() {
                    console.log("Error: member add")
                });
            }
            if (type=='delete') {
                Repay.delete({pid: $scope.shareData.Pid, loanid:$scope.selectedItem._id, repayid:$scope.repayDialog.repay._id}, function success(callback) {
                    //성공한 후 작업
                    console.log(callback);
                    //그리드 갱신
                    $scope.loanQuery();
                    $scope.repayQuery();
                }, function error() {
                    console.log("Error: member add")
                });
            }

            $scope.repayDialog.dialog.close();
        }
        $scope.repayCancel = function() {
            $scope.repayDialog.dialog.close();
        }
        $scope.warnDialog.okClick = function () {
            $scope.warnDialog.dialog.close();
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

        //파일다운로드
        $scope.saveFile = function () {
            var query = '';
            $window.location = '/api/member/' + $scope.shareData.Pid + '/loan?exportfile=1'+query;
        }
    });
