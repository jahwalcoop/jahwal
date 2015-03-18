'use strict';

angular.module('publicApp')
    .controller('NoticeCtrl', function ($scope, headerService, $routeParams, $location, $route, Member, $timeout) {
        if (('실무자' == $scope.$parent.user.MemberClass) || ('이사장' == $scope.$parent.user.MemberClass) || ('센터장' == $scope.$parent.user.MemberClass)) {
            headerService.saveHeader('admin');
            $scope.sitemapurl = "views/include/notice/sitemapadmin.html";
            if ($scope.$parent.zone.Scope == 'all') {
                $scope.sitemapurl = "views/include/notice/sitemapcenteradmin.html";
            }
        } else {
            headerService.saveHeader('user');
            $scope.sitemapurl = "views/include/notice/sitemapuser.html";
        }

        $scope.tab = {privacy: true, sitemap: true}

        //angularjs가 랜더링후 값을 변환하고자 할때 timeout()을 사용한다.
        $timeout(function () {
            if ($routeParams.type == 'privacy') {
                $scope.tab.privacy = true;
            } else {
                $scope.tab.sitemap = true;
            }
        }, 10)

        $scope.getPrivacy = function () {
            return "views/include/notice/privacy.html";
        }

        $scope.getSitemap = function () {
            return $scope.sitemapurl
        }

    });
