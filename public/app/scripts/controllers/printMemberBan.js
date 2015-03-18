'use strict';

angular.module('publicApp')
  .controller('PrintmemberbanCtrl', function ($scope, headerService, $location, $dialog, Shareservice, $window, $timeout, Member, Loan, Fund) {
        headerService.saveHeader('none');
        $scope.shareData = Shareservice.getData();

        Member.query({pid: $scope.shareData.Pid}, function success(callback) {
            //성공한 후 작업
            var member = callback[0];
            $scope.member = member;

            //생년월일
            var bdate = new Date(member.Birthday);
            $scope.bDate = bdate.getFullYear() + '년 ' + (bdate.getMonth() + 1) + '월 ' + bdate.getDate() + '일';

            //가입일
            var rdate = new Date(member.RegDate);
            $scope.regYear = rdate.getFullYear()
            $scope.regMonth = rdate.getMonth() + 1
            $scope.regDay = rdate.getDate()

            //현재
            var now = new Date();
            $scope.thisYear = now.getFullYear()
            $scope.thisMonth = now.getMonth() + 1
            $scope.thisDay = now.getDate()
        }, function error() {
            console.log("Error: print member add")
        });

        //대출데이터
        Loan.list({pid: $scope.shareData.Pid}, function success(callback) {
            //성공한 후 작업
            $scope.loanSum = callback[0].loanSum;
            $scope.repaySum = callback[0].repaySum;
            $scope.loanCnt = callback[0].data.length;
        }, function error() {
            console.log("Error: fund list")
        });

        //출자데이터
        Fund.list({pid: $scope.shareData.Pid}, function success(callback) {
            //성공한 후 작업
            $scope.fundSum = callback.sum;
        }, function error() {
            console.log("Error: fund list")
        });

        //화면랜더링 후 출력하기 위해 $timeout을 사용
        $timeout(function () {
            $window.print();
        }, 100);
    });
