'use strict';

angular.module('publicApp')
    .controller('MemberStatusCtrl', function ($scope, headerService, Shareservice, $location, $route, Member, $modal, $rootScope, Search, $window) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.modal = {content: 'Hello Modal', saved: false};
        $scope.alertDialog = {url: 'views/include/alertForm.html', type: 'delete', message: '삭제하시겠습니까?'};

        $scope.viaService = function () {
            // do something
            var modal = $modal({
//                template: 'views/dialog/memberDetailDlg.html',
                template: 'views/dialog/test.html',
                show: true,
                width: '800px',
                backdrop: 'static',
                scope: $scope
            });
        }
        $scope.parentController = function (dismiss) {
            console.warn(arguments);
            // do something
            dismiss();
        }
        // 그리드 설정
        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [];
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'GroupName', 'title': '사업단'},
            {'field': 'Status', 'title': '상태'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\' ng-click=\"PrintMemberAddClick('#= Pid #')\"><i class=\"icon icon-print\"></i></button>", 'title': '가입', 'width': '50px' });
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\' ng-click=\"PrintMemberBanClick('#= Pid #')\"><i class=\"icon icon-print\"></i></button>", 'title': '탈퇴', 'width': '50px' });
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"MemberDetailClick('#= Pid #')\">상세정보</button>", 'title': '상세정보', 'width': '100px' });
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"MemberBanClick('#= Pid #')\">탈퇴신청</button>", 'title': '탈퇴신청', 'width': '100px' });
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"memberDelete('#= Pid #')\">삭제</button>", 'title': '삭제', 'width': '100px' });
        } else {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\' ng-click=\"PrintMemberAddClick('#= Pid #')\"><i class=\"icon icon-print\"></i></button>", 'title': '가입', 'width': '50px' });
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\' ng-click=\"PrintMemberBanClick('#= Pid #')\"><i class=\"icon icon-print\"></i></button>", 'title': '탈퇴', 'width': '50px' });
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"MemberDetailClick('#= Pid #')\">상세정보</button>", 'title': '상세정보', 'width': '100px' });
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
                            ZoneName: {type: "string"},
                            Status: {type: "string"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }
        //g-click kendo grid : ng-click이 kendo-grid에서 되지 않는 버그가 있다.
        //업데이트하여 해결함.
        //bower_components/angular-kendo-ui
        //https://github.com/kendo-labs/angular-kendo/issues/15
        //http://plnkr.co/edit/VDrv8RQGT4tnKdoubBfh?p=preview
        //http://plnkr.co/edit/8El9nh?p=preview
        //http://plnkr.co/edit/mBfg3IzhP6c0pnw4hjPt?p=preview
        // 삭제하기 다이얼로그
        $scope.memberDelete = function (Pid) {
            $scope.Pid = Pid;
            $scope.alertDialog.message = Pid + ' 사용자를 삭제하시겠습니까?';
            $scope.alertDialog.dialog.center().open();
        };
        $scope.alertDialog.okClick = function () {
            Member.remove({pid: $scope.Pid}, function success(callback) {
                //성공한 후 작업
                console.log("member deleted");
                $scope.Pid = undefined;
                $scope.fnsearch($scope.memberstatus);
            }, function error() {
                console.log("Error: member delete")
            });
            $scope.alertDialog.dialog.close();
        }
        $scope.alertDialog.cancelClick = function () {
            $scope.Pid = undefined;
            $scope.alertDialog.dialog.close();
        }

        // 탈퇴버튼 클릭
        $scope.MemberBanClick = function (Pid) {
            //$scope.modalBan.center().open();
            Shareservice.setData({Pid: Pid, prevLocation: '/memberStatus'});
            $location.path('/memberBan');
        };

        // 상세정보 버튼 클릭
        $scope.MemberDetailClick = function (Pid) {
            Shareservice.setData({Pid: Pid, prevLocation: '/memberStatus'});
            $location.path('/memberDetail');
        };

        // 그리드 선택
        $scope.rowSelected = function (e) {
            var grid = e.sender;
            var selectedRows = grid.select();
            for (var i = 0; i < selectedRows.length; i++) {
                $scope.selectedItem = grid.dataItem(selectedRows[i]);
                console.log($scope.selectedItem.Pid);
                break;
            }
        }

        // 드롭다운리스트 : 조합원 검색조건
        $scope.selectOptSearch = {
            dataSource: {
                data: [
                    { name: "이름", value: "name" },
                    { name: "고유번호", value: "number" },
                    { name: "가입일", value: "date" },
                    { name: "사업단명", value: "zone" }
                ]
            },
            dataTextField: "name",
            dataValueField: "value",
            optionLabel: ""
        };
        $scope.searchTypeText = true;

        // datepicker
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

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
            console.log(cond);
            $scope.searchcond = cond;
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
        //파일다운로드
        $scope.saveFile = function () {
            var query = '';
            for (var name in $scope.searchcond) {
                if (name != 'zone')
                    query += '&' + name + '=' + $scope.searchcond[name];
            }
            $window.location = '/api/search/member/' + $scope.searchcond['zone'] + '?exportfile=1' + query;
        }
        //dialog의 사업단 정보를 가져오기위한 코드
        $scope.$on('zone_get_msg', function (event, data) {
        })
        // 가입 신청서 클릭
        $scope.PrintMemberAddClick = function (Pid) {
            Shareservice.setData({Pid: Pid, prevLocation: '/memberStatus'});
            $location.path('/printMemberAdd');
        };
        // 탈퇴 신청서 클릭
        $scope.PrintMemberBanClick = function (Pid) {
            Shareservice.setData({Pid: Pid, prevLocation: '/memberStatus'});
            $location.path('/printMemberBan');
        };
    });