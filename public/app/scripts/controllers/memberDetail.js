'use strict';
//date가 올바른지 검증을 위한 코드
Date.prototype.valid = function () {
    return isFinite(this);
}

angular.module('publicApp')
  .controller('MemberdetailCtrl', function ($scope, headerService, Shareservice, $location, Member, Zone) {
        headerService.saveHeader('admin');

        $scope.memberform = {url:'views/include/memberForm.html',type:'update'};

        $scope.member = {};
        Zone.get({code: $scope.$parent.user.ZoneCode},function success(callback) {
            //성공한 후 작업
            $scope.member.ZoneCode = callback.Code;
            $scope.member.ZoneName = callback.Name;
            $scope.member.ZoneContact = callback.Contact;
            $scope.groups = callback.Group;
        }, function error() {
            console.log("Error: group list")
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

        $scope.shareData = Shareservice.getData();

        $scope.memberQuery = function () {
            Member.query({pid: $scope.shareData.Pid}, function success(callback) {
                //성공한 후 작업
                $scope.member = callback[0];
                var Birthday = new Date(callback[0].Birthday);
                if (Birthday.valid())
                    $scope.member.Birthday = Birthday;
                var RegDate = new Date(callback[0].RegDate);
                if (RegDate.valid())
                    $scope.member.RegDate = RegDate;
                var DropDate = new Date(callback[0].DropDate);
                if (DropDate.valid())
                    $scope.member.DropDate = DropDate;

                console.log($scope.member);
            }, function error() {
                console.log("Error: member add")
            });
        }

        $scope.memberQuery();

        $scope.submit = function () {
            Member.update({pid:  $scope.member.Pid}, $scope.member, function success(callback) {
                //저장되었습니다 팝업후 리스트로 복귀
                $scope.modalSave.center().open();
            }, function error() {
                console.log("Error: member add")
            });
        }

        //주소검색
        $scope.address = {}
        $scope.address.search = function (token) {
            Address.list({search:token}, function success(callback) {
                //성공한 후 작업
                console.log(callback);
                if(callback.length == 0) {
                    $scope.address.data = [{Address:'검색결과가 없습니다'}]
                } else {
                    $scope.address.data = callback;
                }
            }, function error() {
                console.log("Error: address search")
            });
        }
        $scope.address.select = function(addr) {
            $scope.member.Address = addr;
            $scope.address.dialog.close();
        }

        //비밀번호초기화
        $scope.resetpw = {};
        $scope.resetPassword = function () {
            $scope.resetpw.dialog.center().open()
        }
        $scope.resetpw.submit = function () {
            Zone.get({code: $scope.$parent.user.ZoneCode},function success(callback) {
                //초기 비밀번호를 가져온다.
                if(callback.DefaultPw == null || callback.DefaultPw == undefined ){
                    //비밀번호가 없으면 경고
                    $scope.resetpw.warndialog.center().open();
                } else {
                    $scope.member.passwordnew = callback.DefaultPw;
                    //저장하기
                    $scope.resetpw.dialog.close();
                    $scope.submit();
                }
            }, function error() {
                console.log("Error: passwd");
            });
        }
        $scope.resetpw.cancel = function () {
            $scope.resetpw.dialog.close();
        }

        $scope.resetpw.warn = function () {
            $scope.resetpw.dialog.close();
            $scope.resetpw.warndialog.close();
        }

        $scope.gotoInvestStatus = function () {
            Shareservice.setData({Pid:$scope.member.Pid,Name:$scope.member.Name});
            $location.path('/investStatusDetail')
        }

        $scope.gotoLoanStatus = function () {
            Shareservice.setData({Pid:$scope.member.Pid,Name:$scope.member.Name});
            $location.path('/loanStatusDetail')
        }
        $scope.complete = function() {
            $scope.modalSave.close();
            $scope.memberQuery();
        }

        //사용자권한에 따른 기능제한
    });
