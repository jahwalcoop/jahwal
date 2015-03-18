'use strict';

angular.module('publicApp')
  .controller('UserviewCtrl', function ($scope, headerService, Shareservice, $location, User, Zone) {
        headerService.saveHeader('user');

        $scope.memberform = {url:'views/include/memberViewUser.html',type:'view'};

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
            console.log("Error: member add")
        });

        $scope.kopts = {start: "day", depth: "day", format: "yyyy/MM/dd"};

        $scope.submit = function () {
            $location.path('/userUpdate')
        }
  });
