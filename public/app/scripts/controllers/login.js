'use strict';

angular.module('publicApp')
    .controller('LoginCtrl', function ($scope, headerService, $location, Auth, $http, $cookies, $rootScope) {
        headerService.saveHeader('none');

        $scope.ver = $cookies.ver;

        $http.get('/version').success(function (callback) {
            var newVersion = callback.version;
            var currVersion = $cookies.ver;
            console.log(callback);
            if (newVersion != currVersion) {
                $cookies.ver = newVersion;
                $rootScope.$broadcast('event:versionUp-refresh');
            }
        });
        var section = 1;

        $scope.section = function (id) {
            section = id;
        };

        $scope.is = function (id) {
            return section == id;
        };

        $scope.pid = $cookies.pid;

        $scope.submitLogin = function () {
            console.log('submit:' + $scope.pid + ' ' + $scope.password);
            $cookies.pid = $scope.pid;

            Auth.login({pid: $scope.pid, password: $scope.password}, function success(callback) {
                $scope.password = null;
                $scope.$parent.user = callback;
                $location.path('/');
            }, function error() {
                console.log("Error: login")
            });
        }

        var removeListener = $scope.$on('event:auth-failed', function () {
            console.log('Error: login - event:auth-failed');
            $scope.alert.visible = true;
        });

        $scope.$on('event:auth-success', function () {
            removeListener();
            $scope.alert.visible = false;
            $scope.success.visible = true;
        });

        $scope.alert = {
            type: "error",
            title: "로그인오류 : ",
            content: "가입되지 않은 사용자이거나 비밀번호가 올바르지 않습니다.",
            visible: false
        }

        $scope.success = {
            type: "info",
            title: "로그인 : ",
            content: "환영합니다.",
            visible: false
        }
    });
