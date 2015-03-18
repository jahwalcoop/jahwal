'use strict';

angular.module('publicApp')
    .controller('CommonCtrl', function ($scope, headerService, $location, $route, Auth, $http, Dashboard, Zone, User, Address, $timeout, $rootScope, $cookies, $window) {
        $scope.dashboard = {};
        $scope.user = {};
        $scope.header = {};

        $timeout(function () {
            $route.reload();
        }, 1);

        $scope.$on('header_message', function (event, type) {
            $scope.header.type = type;
            if (type != 'none') { //admin,user
                $http.get('/account').success(function (callback) {
                    //401 error가 되는지 알아본다.
                    //NOTE : 401이 되면 app.js의 run부분에 $rootscope로 broadcast되는 부분을 타게 되어 login상태가 아니면 login화면으로 route된다.
                    $scope.user = callback;

                    //사용자권한에 따른 기능제한
                    $scope.adminPermit = false;
                    if($scope.user.MemberClass == '관리자' || $scope.user.MemberClass == '실무자') {
                        $scope.adminPermit = true;
                    }

                    Zone.get({code: $scope.user.ZoneCode}, function success(callback) {
                        //성공한 후 작업
                        $scope.zone = callback;
                        //데이터가 없을때 zone에 접근하는경우 오류가 발생하므로 메시지 방식으로 변경
                        $rootScope.$broadcast('zone_get_msg', callback);
                        // 관리자이면 대쉬보드 정보를 가져온다.
                        if (type == 'admin') {
                            Dashboard.query({zone: $scope.zone.Scope}, function success(callback) {
                                $scope.dashboard.memberall = callback[0].val;
                                $scope.dashboard.membernew = callback[1].val;
                                $scope.dashboard.memberban = callback[2].val;
                                $scope.dashboard.fundall = callback[3].val;
                                $scope.dashboard.fundbanall = callback[4].val;
                                $scope.dashboard.loanall = callback[5].val;
                                $scope.dashboard.repayall = callback[6].val;
                            })
                        }
                    }, function error() {
                        console.log("Error: group list")
                    });

                    // 버전을 체크하여 업데이트 함
                    // 탭을 2개이상 열고 작엽하는 경우 1개만 리프레시되고 나머지는 리프레쉬 되지 않는 현상 방지
                    $http.get('/version').success(function (callback) {
                        var currVersion = $rootScope.version;
                        var newVersion = callback.version;
                        console.log(callback);
                        if (newVersion != currVersion) {
                            $scope.updateDialog.message = '시스템 버전이 '+currVersion+'에서 '+newVersion+'로 변경되었습니다.\n'
                            $scope.updateDialog.message += '업데이트를 위하여 브라우저가 갱신됩니다.'

                            $scope.updateDialog.dialog.center().open();
                        }
                    });

                    console.log('success account:');
                });
            }

        });

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active ? "active" : "";
        };
        $scope.getTop = function () {
            return "views/header/searchbar.html";
        }
      /*  $scope.getLogout = function () {
            return "views/header/logout.html";
        }*/

        // ZoneCode가 coop1 일떄만 대쉬보드에 " 연홥회"로 표시, 다른 ZoneCode일떄는 자활공제협동조합
        $scope.getLogout = function () {

            console.log("ZoneCode : " + $scope.zone);

            if (  $scope.member.ZoneCode == 'coop1') {
                console.log("ZoneCode coop1");
                return "views/header/sub_logout.html";

            } else {
                console.log("ZoneCode Not coop1")
                return "views/header/logout.html";
            }

        }

        $scope.getDashBoard = function () {
            return "views/header/dashboard.html";
        }
        $scope.getMenu = function () {
            return "views/header/navbar.html";
        }
        $scope.getUserMenu = function () {
            return "views/header/navbarUser.html";
        }
        $scope.logout = function () {
            Auth.logout(function success(callback) {
                $location.path('/');
            });
        }

        $scope.dialog = {
            memberdetail: {url: "views/dialog/memberDetailDlg.html"},
            memberdel: {url: "views/dialog/memberDelDlg.html"}
        }

        //사용자 정보수정
        $scope.userModifyClick = function () {
            $http.get('/account').success(function (callback) {
                //401 error가 되는지 알아본다.
                //NOTE : 401이 되면 app.js의 run부분에 $rootscope로 broadcast되는 부분을 타게 되어 login상태가 아니면 login화면으로 route된다.
                $scope.member = callback;

                console.log('success account:');
            });
            $scope.memberform.dialog.center().open();
        }

        //리프레쉬 확인
        var updateDialogOk = function () {
            $rootScope.$broadcast('event:versionUp-refresh');
        }
        //userUpdate부분을 거의 그대로 옮겨옴
        $scope.memberform = {url: 'views/include/memberFormUser.html', type: 'update'};
        $scope.warnDialog = {url: 'views/include/warnForm.html', message: ''};
        $scope.updateDialog = {url: 'views/include/updateForm.html', message: '', okClick: updateDialogOk};
        $scope.$watch('user', function (newVal, oldVal) {
            if (newVal) {
                $scope.member = $scope.user;
                Zone.get({code: $scope.member.ZoneCode}, function success(callback) {
                    //성공한 후 작업
                    $scope.member.ZoneCode = callback.Code;
                    $scope.member.ZoneName = callback.Name;
                    $scope.member.ZoneContact = callback.Contact;
                    $scope.groups = callback.Group;
                    console.log('group success')
                    console.log(callback);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        }, true);
        $scope.$watch('member.GroupName', function (newVal, oldVal) {
            if (newVal) {
                console.log(newVal);
                for (var i = 0; i < $scope.groups.length; i++) {
                    if (newVal == $scope.groups[i].GroupName) {
                        $scope.member.GroupPhone = $scope.groups[i].GroupPhone;
                        break;
                    }
                }
            }
        }, true);
        $scope.select2Options = {
            allowClear: false,
            multiple: false,
            minimumResultsForSearch: 99
        };

        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

        $scope.userSubmit = function () {
            console.log($scope.member.passwordnew);
            User.update({pid: $scope.member.Pid}, $scope.member, function success(callback) {
                //저장되었습니다 팝업후 리스트로 복귀
                if (callback.message == 'pwerror') {
                    $scope.warnDialog.message = '비밀번호 오류입니다.'
                } else {
                    $scope.warnDialog.message = '조합원 ' + $scope.member.Name + '님의 개인정보가 변경되었습니다.'
                }
                $scope.warnDialog.dialog.center().open();
            }, function error() {
                console.log("Error: user update")
            });
        }
        $scope.userCancel = function () {
            $scope.memberform.dialog.close();
        }
        //확인
        $scope.warnDialog.okClick = function () {
            $scope.warnDialog.dialog.close();
            $scope.memberform.dialog.close();
            $route.reload();
        }
        //주소검색
        $scope.address = {}
        $scope.address.search = function (token) {
            Address.list({search: token}, function success(callback) {
                //성공한 후 작업
                console.log(callback);
                if (callback.length == 0) {
                    $scope.address.data = [
                        {Address: '검색결과가 없습니다'}
                    ]
                } else {
                    $scope.address.data = callback;
                }
            }, function error() {
                console.log("Error: address search")
            });
        }
        $scope.address.select = function (addr) {
            $scope.member.Address = addr;
            $scope.address.dialog.close();
        }
        //버전업 공지사항
        $scope.noticeDialog = {url: 'views/include/noticeForm.html', messages: []}; //add,update,delete
        $scope.$on('loginSuccess_message', function (event, type) {
            $http.get('/version').success(function (callback) {
                $scope.ver = callback.version;
                var newVersion = callback.version;
                var noticeVersion = $cookies.noticeVer;

                $scope.noticeDialog.messages = [
                    '화면 폭이 더 넓어졌습니다.',
                    '이사장/센터장으로 로그인 시 수정/삭제가 되지 않도록 변경했습니다.',
                    '출자금 > 개인출자신청조회에 출자계 항목이 추가되었습니다.',
                    '대쉬보드에 탈퇴금 항목이 추가되었습니다.',
                    '대출신청기입절차에 이자율 입력 시 소수점도 가능하도록 수정하였습니다.'
//                    <1.0.12>
//                    '조합원 삭제 기능이 추가되었습니다.',
//                    '조합원/출자금/대출금 내역을 엑셀형식으로 내려받을 수 있습니다.'
//                    <1.0.11>
//                    '조합원 ID포맷이 변경되었습니다.',
//                    '조합원추가시 ID를 조합코드-조합원번호 형식으로만 부여됩니다.'
//                    <1.0.10>
//                    '조합원 검색시 전체가 아닌 이름을 기본조건으로 합니다.',
//                    '관리자설정>우리지역관련설정에서 사업단이 20개이상 표시됩니다.',
//                    '출자현황조회에서 출자금 내역을 프린트할 수 있습니다.',
//                    '대출/상환 내역에 사업단 정보를 기입할 수 있습니다.'
//                    <1.0.9>
//                    '관리자설정에서 자활명,주소,연락처를 수정할 수 있습니다.',
//                    '출자금에서 감자(반환금)내역을 입력할 수 있습니다.',
//                    '조합원 탈퇴시 총출자금과 미상환금액을 표기합니다.'
//                    <1.0.8>
//                    '조합원 데이터 입력시 양력이 초기값으로 선택됩니다',
//                    '조합원 데이터 입력/수정시 연락처,휴대폰 둘중에 하나만 입력되어도 됩니다',
//                    '조합원ID를 관리자가 임의로 정할 수 있도록 변경되었습니다.'
//                    <1.0.7>
//                    '타이틀 베너 이미지가 "자활공제 협동조합"으로 변경되었습니다',
//                    '조합원 추가/수정시 주소검색 속도가 빨라졌습니다',
//                    '주소검색시 읍/면/동으로 검색하도록 변경하였습니다',
//                    '사업단에 "지역자활명칭"이 표시되는것을 "조합원이 속한 사업단"을 표시하는것으로 변경하였습니다'
                ]
                if (newVersion != noticeVersion) {
                    //다이얼로그 띄우기
                    $scope.noticeDialog.dialog.center().open();
                }
            });
        });
        $scope.noticeDialog.okClick = function (checked) {
            if (checked) {
                //버전업 공지사항 disable
                console.log(checked);
                $cookies.noticeVer = $scope.ver;
                $scope.noticeDialog.checked = false;
            }
            $scope.noticeDialog.dialog.close();
        }
        $scope.test = function() {
            $window.location = '/api/export/excel';
        }
    });
