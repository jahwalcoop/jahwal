'use strict';

function prefixZeros(number, maxDigits) {
    var length = maxDigits - number.toString().length;
    if (length <= 0)
        return number;

    var leadingZeros = new Array(length + 1);
    return leadingZeros.join('0') + number.toString();
}


angular.module('publicApp')
    .controller('MemberAddCtrl', function ($scope, $location, $route, headerService, Member, Zone, Address) {
        headerService.saveHeader('admin');

        $scope.memberform = {url: 'views/include/memberForm.html', type: 'add'};
        $scope.warnDialog = {url: 'views/include/warnForm.html', message: ''};

        $scope.member = {
            Birthday: null,
            RegDate: new Date(),
            Status: '활동중',
            MemberClass: '조합원',
            CalendarType: '양력',
            Phone: '',
            CellPhone: '',
            Note: ''
        }
        $scope.$on('zone_get_msg', function (event, data) {
            $scope.member.ZoneCode = data.Code;
            $scope.member.ZoneName = data.Name;
            $scope.member.ZoneContact = data.Contact;
            $scope.member.Password = data.DefaultPw;
            $scope.member.Fee = data.MembershipFee;
            $scope.groups = data.Group;
        });

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
        $scope.submit = function () {
            console.log('save');
            Member.create($scope.member, function success(callback) {
                //성공한 후 작업
                console.log(callback);
                if (callback.error) {
                    $scope.warnDialog.message = callback.error;
                    $scope.warnDialog.dialog.center().open();
                } else {
                    $scope.modalSave.center().open();
                }
            }, function error() {
                console.log("Error: member add")
            });
        }
        $scope.complete = function () {
            //$location.path('/memberAdd');
            $route.reload();
        }
        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

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

        //약정출자금
        $scope.$watch('member.FundingMethod', function (newVal, oldVal) {
            console.log(newVal);
            if (newVal == '수시출자') {
                delete $scope.member.PromisedMoney;
            }
        }, true);

        //ID검색하여 추가
        $scope.validPid = {type: 'auto', success: true, id: '', check: false};
        $scope.$watch('validPid.type', function (newVal, oldVal) {
            console.log(newVal);
            if (newVal) {
                delete $scope.member.Pid;
                delete $scope.member.customPid;
                if (newVal == 'auto') {
                    $scope.validPid.success = true;
                } else {
                    $scope.validPid.success = false;
                    $scope.validPid.message = '중복확인을 해 주세요';
                    $scope.member.customPid = prefixZeros(Number($scope.zone.Seq)+1,6);
                }
            }
        }, true);

        //Pid검증
        $scope.$watch('member.Pid', function (newVal, oldVal) {
            console.log(newVal);
            if (newVal == undefined) {
                $scope.validPid.check = false;
//            } else if (newVal.length <= 4) {
//                $scope.validPid.check = false;
//            } else {
//                $scope.validPid.check = true;
//                $scope.validPid.message = '중복확인을 해 주세요';
//                console.log(newVal);
//
//                if (newVal.toUpperCase().substr(0,4) == 'COOP') {
//                    $scope.validPid.check = false;
//                    $scope.validPid.message = 'COOP으로 시작되는 ID는 사용할 수 없습니다.';
//                } else {
//                    $scope.validPid.check = true;
//                }
            }
        }, true);

        //중복체크
        $scope.checkDuplicate = function () {
            $scope.member.Pid =  $scope.member.ZoneCode+'-'+$scope.member.customPid;
            Member.query({pid: $scope.member.Pid}, function (callback) {
                console.log(callback)
                if (callback.length >= 1) {
                    $scope.validPid.success = false;
                    $scope.validPid.message = '사용중인 ID입니다'
                    $scope.warnDialog.message = '사용중인 ID입니다';
                } else {
                    $scope.validPid.success = true;
                    $scope.warnDialog.message = $scope.member.Pid +'는 사용할수있는 ID입니다';
                }
                $scope.warnDialog.dialog.center().open();
            })
        }

        //확인
        $scope.warnDialog.okClick = function () {
            $scope.warnDialog.dialog.close();
        }
    });
