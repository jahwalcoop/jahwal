'use strict';
//date가 올바른지 검증을 위한 코드
Date.prototype.valid = function () {
    return isFinite(this);
}

angular.module('publicApp')
  .controller('MemberbanCtrl', function ($scope, headerService, Shareservice, $location, Member, Zone, FundSummary, Loan) {
        headerService.saveHeader('admin');

        $scope.memberform = {url:'views/include/memberForm.html',type:'delete'};

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

                // 출자액수
                FundSummary.sum({pid: $scope.member.Pid}, function success(result) {
                    $scope.fundedMoney = result.MoneySumAll;
                }, function error() {
                    console.log("Error: fund list")
                });

                // 미상환금액수
                Loan.list({pid: $scope.member.Pid,status:'all'}, function success(callback) {
                    $scope.remainedLoan = callback[0].loanSum - callback[0].repaySum;
                }, function error() {
                    console.log("Error: fund list")
                });

                console.log($scope.member);
            }, function error() {
                console.log("Error: member add")
            });
        }

        $scope.memberQuery();

        $scope.returnPrev = function () {
            console.log($scope.shareData.prevLocation)
            $location.path($scope.shareData.prevLocation)
        }
        $scope.submit = function () {
            $scope.member.Status = "탈퇴";

            Member.update({pid:  $scope.member.Pid}, $scope.member, function success(callback) {
                //저장되었습니다 팝업후 리스트로 복귀
                $scope.modalSave.center().open();
            }, function error() {
                console.log("Error: member add")
            });
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
            $location.path('/memberStatus');
        }
  });
