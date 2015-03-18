'use strict';

angular.module('publicApp')
  .controller('UserupdateCtrl', function ($scope, headerService, Shareservice, $location, $route, User, Zone, Address) {
        headerService.saveHeader('user');

        $scope.memberform = {url:'views/include/memberFormUser.html',type:'update'};
        $scope.warnDialog = {url:'views/include/warnForm.html',message:''}; //add,update,delete

        $scope.password={
            new:'',
            current:'',
            repeat:''
        };
        $scope.member = {};
        Zone.get({code: $scope.$parent.user.ZoneCode},function success(callback) {
            //성공한 후 작업
            $scope.member.ZoneCode = callback.Code;
            $scope.member.ZoneName = callback.Name;
            $scope.member.ZoneContact = callback.Contact;
            $scope.groups = callback.Group;

            console.log(callback);
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

        $scope.user = $scope.$parent.user;

        User.get({pid: $scope.user.Pid}, function success(callback) {
            //성공한 후 작업
            $scope.member = callback;
            console.log($scope.member);
        }, function error() {
            console.log("Error: user get")
        });

        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

        $scope.userSubmit = function () {
            console.log($scope.member.passwordnew);
            User.update({pid:  $scope.member.Pid}, $scope.member, function success(callback) {
                //저장되었습니다 팝업후 리스트로 복귀
                if(callback.message == 'pwerror') {
                    $scope.warnDialog.message = '비밀번호 오류입니다.'
                } else {
                    $scope.warnDialog.message = '조합원 '+$scope.member.Name+'님의 개인정보가 변경되었습니다.'
                }
                $scope.warnDialog.dialog.center().open();
            }, function error() {
                console.log("Error: user update")
            });
        }
        $scope.userCancel = function () {
            $location.path('/userView');
        }
        //확인
        $scope.warnDialog.okClick = function () {
            $scope.warnDialog.dialog.close();
            $location.path('/serView')
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

        //패스워드
        //http://stackoverflow.com/questions/14012239/password-check-directive-in-angularjs
  });
