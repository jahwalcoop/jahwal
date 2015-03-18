'use strict';

angular.module('publicApp')
    .controller('AdminpermitCtrl', function ($scope, headerService, Shareservice, $timeout, $location, Member, Search, Loan) {
        headerService.saveHeader('admin');

        $scope.permitDialog = {url: 'views/include/permitForm.html', type: 'update', data: {}, permit: {}};

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [
            {'field': 'Pid', 'title': '개인고유번호'},
            {'field': 'Name', 'title': '이름'},
            {'field': 'Birthday', 'template': "#= kendo.toString(kendo.parseDate(Birthday, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '생년월일'},
            {'field': 'RegDate', 'template': "#= kendo.toString(kendo.parseDate(RegDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '가입일'},
            {'field': 'ZoneName', 'title': '사업단명'},
            {'field': 'Status', 'title': '상태'},
            {'field': 'MemberClass', 'title': '권한'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.$parent.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'k-button\' ng-click=\"showModal('#= Pid #','#= Name #','#= MemberClass #')\">수정하기</button>", 'title': '권한수정' });
        }
        $scope.reloadGrid = function (data) {
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            Pid: {type: "string"},
                            Name: {type: "string"},
                            Birthday: {type: "date"},
                            RegDate: {type: "date"},
                            ZoneName: {type: "string"},
                            Status: {type: "string"},
                            MemberClass: {type: "string"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        $scope.showModal = function (Pid, Name, MemberClass) {
            $scope.permitDialog.data.Pid = Pid;
            $scope.permitDialog.data.Name = Name;
            $scope.permitDialog.permit.MemberClass = MemberClass;
            console.log($scope.permitDialog.permit.MemberClass);
            $scope.permitDialog.dialog.center().open();
        };
        $scope.permitSubmit = function (type) {
            console.log($scope.permitDialog.permit);
            Member.query({pid: $scope.permitDialog.data.Pid}, function success(callback) {
                //성공한 후 작업
                $scope.member = callback[0];
                $scope.member.MemberClass = $scope.permitDialog.permit.MemberClass;
                Member.update({pid: $scope.member.Pid}, $scope.member, function success(callback) {
                    $scope.fnsearch();
                    console.log("member update");
                }, function error() {
                    console.log("Error: member update");
                });
            }, function error() {
                console.log("Error: member query");
            });

            $scope.permitDialog.dialog.close();
        }
        $scope.permitCancel = function () {
            $scope.permitDialog.dialog.close();
        }
        // 드롭다운리스트 : 조합원유형
        $scope.permitTypes = [
            { permitType: "조합원" },
            { permitType: "실무자" },
            { permitType: "센터장" },
            { permitType: "이사장" }
        ];
        //조합원검색조건
        $scope.search = {selected:"name"};
        $scope.searchTypeText = true;
        $scope.$watch('search.selected', function (val) {
            if ($scope.search.selected == 'regdate') {
                $scope.searchTypeText = false;
            } else {
                $scope.searchTypeText = true;
            }
            $scope.search.value = '';
        });
        //검색하기
        $scope.fnsearch = function () {
            //검색조건을 만든다
            //zone조건
            var cond = {};
            cond['zone'] = $scope.$parent.user.ZoneCode;
            //검색폼 입력 결과.
            if ($scope.search.selected != 'all') {
                cond[$scope.search.selected] = $scope.search.value;
            }
            console.log(cond);
            Search.memberlist(cond, function success(callback) {
                //성공한 후 작업
                $scope.memberCnt = callback.length;
                $scope.reloadGrid(callback);
            }, function error() {
                console.log("Error: fund list")
            });
        }
        //검색조건
        $scope.searchparams = [
            {value: 'name', text: '이름'},
            {value: 'pid', text: '고유번호'},
            {value: 'regdate', text: '가입일'},
            {value: 'zonename', text: '사업단명'}
        ];
    });
