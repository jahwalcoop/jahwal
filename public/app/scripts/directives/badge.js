'use strict';

angular.module('publicApp')
    .directive('badge', function () {
        return {
            restrict: 'EA',
            require: '^ngStatus',
            scope: {
                ngStatus: '@'
            },
            template: '<span class="badge mydirectiveclass">{{ngStatus}}' +
                '</span>',
            controller: ['$scope', function($scope) {
                $scope.ngClass='label-success'
                if ($scope.ngStatus == '활동중') {
                    $scope.ngClass='label-success'
                } else if($scope.ngStatus == '탈퇴') {
                    $scope.ngClass='label-warning'
                } else {
                    $scope.ngStatus='&nbsp;'
                }
            }],
            link: function (scope, elem, attrs) {
                $(".mydirectiveclass").css({'background-color' : 'yellow'});
            }
        }
    });
