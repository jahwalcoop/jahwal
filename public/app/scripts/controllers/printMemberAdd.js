'use strict';

angular.module('publicApp')
    .controller('PrintmemberaddCtrl', function ($scope, headerService, $location, $dialog, Shareservice, $window, $timeout, Member) {
        headerService.saveHeader('none');
        $scope.shareData = Shareservice.getData();

        Member.query({pid: $scope.shareData.Pid}, function success(callback) {
            //성공한 후 작업
            var member = callback[0];
            $scope.member = member;

            //생년월일
            var bdate = new Date(member.Birthday);
            $scope.bDate = bdate.getFullYear() + '년 ' + (bdate.getMonth() + 1) + '월 ' + bdate.getDate() + '일';

            //출자좌수&금액
            $scope.fundingStatus = '';
            if ($scope.member.FundingMethod == '정기출자') {
                var moneycut = $scope.$parent.zone.MoneyCut;
                $scope.fundingStatus = member.PromisedMoney / moneycut + '좌 (' + member.PromisedMoney + '원)';
            } else {
                $scope.fundingStatus = member.FundingMethod;
            }

            //가입일
            var rdate = new Date(member.RegDate);
            $scope.regYear = rdate.getFullYear()
            $scope.regMonth = rdate.getMonth() + 1
            $scope.regDay = rdate.getDate()
        }, function error() {
            console.log("Error: print member add")
        });

        //화면랜더링 후 출력하기 위해 $timeout을 사용
        $timeout(function () {
            $window.print();
        }, 100);
    });
