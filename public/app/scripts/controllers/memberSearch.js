'use strict';

angular.module('publicApp')
    .controller('MemberSearchCtrl', function ($scope, $location, $route, headerService, Member, Zone, Summary) {
        headerService.saveHeader('admin');

        $scope.select2Options = {
            allowClear: false,
            multiple: false,
            minimumResultsForSearch: 99
        };

        $scope.memberSumary = {
            tot: {sum: 0, in: 0, out: 0},
            all: {sum: 0, in: 0, out: 0}
        }
        $scope.submit = function () {
            //누계
            Summary.member({zone: $scope.zonecode, group: $scope.groupname}, function success(callback) {
                //성공한 후 작업
                var outCnt = 0, inCnt = 0;
                var result = callback;

                for (var i = 0; i < result.length; i++) {
                    if (result[i]._id == "탈퇴") {
                        outCnt = result[i].count;
                    } else {
                        inCnt += result[i].count;
                    }
                }

                $scope.memberSumary.all.sum = inCnt + outCnt;
                $scope.memberSumary.all.in = inCnt;
                $scope.memberSumary.all.out = outCnt;
            }, function error() {
                console.log("Error: zone list")
            });

            //총계
            var fromdate = $scope.fromdate;
            var todate = $scope.todate;
            Summary.member({zone: $scope.zonecode, group: $scope.groupname, fromdate: fromdate, todate: todate}, function success(callback) {
                //성공한 후 작업
                var outCnt = 0, inCnt = 0;
                var result = callback;

                for (var i = 0; i < result.length; i++) {
                    if (result[i]._id == "탈퇴") {
                        outCnt = result[i].count;
                    } else {
                        inCnt += result[i].count;
                    }
                }

                $scope.memberSumary.tot.sum = inCnt + outCnt;
                $scope.memberSumary.tot.in = inCnt;
                $scope.memberSumary.tot.out = outCnt;
            }, function error() {
                console.log("Error: zone list")
            });
        }
        //조회기간버튼
        $scope.tbutton = {
            label: '전체'
        }
        $scope.$watch('tbutton.active', function (newVal, oldVal) {
            if (newVal == true) {
                $scope.tbutton.label = '전체'
                $scope.fromdate = null;
                $scope.todate = null;
            } else {
                $scope.tbutton.label = '기간별'
            }
        }, true);
        //지역선택
        $scope.zonecode = null;
        $scope.groups = [];
        $scope.$on('zone_get_msg', function (event, data) {
            if (data.Scope == 'all') {
                Zone.list(function success(callback) {
                    //성공한 후 작업
                    callback.unshift({Code: 'all', Name: '전체'})
                    $scope.zones = callback;
                    $scope.zonecode = 'all';
                    $scope.disablezone = false;

                    console.log(callback);
                }, function error() {
                    console.log("Error: zone list")
                });
            } else {
                Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                    //성공한 후 작업
                    $scope.zones = [callback];
                    $scope.groups = callback.Group;
                    $scope.zonecode = callback.Code;
                    $scope.disablezone = true;

                    console.log($scope.groups);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        });
        $scope.$watch('zonecode', function (newVal, oldVal) {
            if (newVal) {
                Zone.get({code: newVal}, function success(callback) {
                    //성공한 후 작업
                    $scope.groups = callback.Group;

                    console.log(callback);
                }, function error() {
                    console.log("Error: group list")
                });
            }
        }, true);
        //사업단 선택
        $scope.groupname = 'all';
    });
