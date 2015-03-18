'use strict';

angular.module('publicApp')
    .controller('MainCtrl', function ($scope, headerService, $location, $http, $rootScope) {
        //TODO : 로그인 로직의 개선이 필요하다.
        //401이 발생하면 event:auth-loginRequired가 발생하여 login페이지로 이동하고 login상태이면 분기한다.
        $http.get('/account').success(function (callback) {
            var user = callback;
            if ((user.MemberClass == '관리자') || (user.MemberClass == '실무자') || (user.MemberClass == '센터장') || (user.MemberClass == '이사장')) {
                $location.path('/memberSearch');
                $rootScope.$broadcast('loginSuccess_message', 'admin');
            } else {
                $location.path('/userView');
            }
        });
    });
