'use strict';

angular.module('publicApp')
  .controller('MemberallCtrl', function ($scope, headerService, Shareservice, $location, $route, Member, $modal, $rootScope, Search) {
        headerService.saveHeader('admin');

        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.modal = {content: 'Hello Modal', saved: false};
        $scope.viaService = function() {
            // do something
            var modal = $modal({
//                template: 'views/dialog/memberDetailDlg.html',
                template: 'views/dialog/test.html',
                show: true,
                width:'800px',
                backdrop: 'static',
                scope: $scope
            });
        }
        $scope.parentController = function(dismiss) {
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
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'ZoneName', 'title': '사업단명'},
            {'field': 'Status', 'title': '상태'},
            {'template': "<button class=\'k-button\' ng-click=\"showModalPerson('#= Pid #')\">상세정보</button>", 'title': '상세정보/편집' },
            {'template': "<button class=\'k-button\' ng-click=\"showModalBan('#= Pid #')\">탈퇴신청</button>", 'title': '탈퇴신청' },
            {'template': "<button class=\'k-button\' ng-click=\"memberDelete('#= Pid #')\">삭제</button>", 'title': '삭제' }
        ];
        $scope.reloadGrid = function (data) {
            console.log('data:' + data);
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
        //삭제하기
        $scope.memberDelete = function (Pid) {
            //$scope.modalBan.center().open();
            Member.remove({pid: Pid}, function success(callback) {
                //성공한 후 작업
                console.log("member deleted");
                $route.reload();
            }, function error() {
                console.log("Error: member delete")
            });

        };
        //탈퇴신청 모달창
        $scope.showModalBan = function (Pid) {
            //$scope.modalBan.center().open();
            Shareservice.setData({Pid:Pid,prevLocation:'/memberStatus'});
            $location.path('/memberDelete');
        };
        $scope.deleteProduct = function (id) {
            var raw = $scope.kgdatasource.data();
            var length = raw.length;
            var item, i;
            for (i = length - 1; i >= 0; i--) {
                item = raw[i];
                if (item.PrivateId === id) {
                    raw.remove(item);
                    //TODO call remote service to delete item....
                }
            }
            $scope.modalBan.close();
        };
        $scope.memberBanOk = function () {
            $scope.modalBan.close();
        }
        $scope.cancel = function () {
            $scope.modalBan.close();
        }

        // 상세정보 모달창
        $scope.showModalPerson = function (Pid) {
            Shareservice.setData({Pid:Pid,prevLocation:'/memberStatus'});
            $location.path('/memberDetail');
        };
        $scope.modalPersonOk = function () {
            //업데이트 후 창을 닫는다.
            $scope.member.RegDate = $scope.RegDate;
            $scope.member.Birthday = $scope.Birthday;
            Member.update({pid: $scope.currntPid}, $scope.member, function success(callback) {
                //성공한 후 작업
                $scope.member = callback[0];
                console.log(callback[0]);
            }, function error() {
                console.log("Error: member add")
            });
        }
        $scope.modalPersonCancel = function () {
            $scope.modalPerson.close();
        }

        // 비밀번호 초기화 모달창
        $scope.showModalPasswd = function (id) {
            $scope.modalPasswd.center().open();
        };
        $scope.modalPasswdOk = function () {
            $scope.modalPasswd.close();
        }
        $scope.modalPasswdCancel = function () {
            $scope.modalPasswd.close();
        }

        // 상세정보-탈퇴신청 스위칭
        $scope.switchModalBan = function () {
            $scope.modalPerson.close();
            $scope.showModalBan($scope.currntPid);
        }

        // 상세정보->출자대출상황 바로가기
        $scope.gotoInvestStatus = function () {
            $location.path('/investStatusDetail')
        }

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
        $scope.selectChangeSearch = function (e) {
            console.log(e.sender.value());
            console.log(e.sender.text());
            var selected = e.sender.text();
            if (selected == "가입일") {
                $scope.searchTypeText = false;
            } else {
                $scope.searchTypeText = true;
            }
        };

        // 드롭다운리스트 : 상세정보-탈퇴신청
        $scope.selectOptions = {
            dataSource: {
                data: [
                    { name: "1좌", value: 1 },
                    { name: "2좌", value: 2 },
                    { name: "3좌", value: 3 },
                    { name: "4좌", value: 4 },
                    { name: "5좌", value: 5 }
                ]
            },
            dataTextField: "name",
            dataValueField: "value",
            optionLabel: ""
        };
        $scope.selectChange = function (e) {
            console.log(e.sender.value());
            console.log(e.sender.text());
        };
        // datepicker
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

        //조합원검색조건
        $scope.search = {};
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
            cond['zone'] = 'all';
            //검색폼 입력 결과
            if($scope.search.selected != 'all') {
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