'use strict';

angular.module('publicApp')
    .controller('AdminlocalCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Group, Zone) {
        headerService.saveHeader('admin');

        $scope.groupDialog = {url: 'views/include/groupForm.html', type: 'add', group: {}, data: {}};

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgpageable = { 'refresh': false, 'pageSizes': false };
        $scope.kgdatasource = new kendo.data.DataSource({
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [
            {'field': 'GroupName', 'title': '사업단 이름'},
            {'field': 'ContactName', 'title': '사업단 대표자'},
            {'field': 'GroupPhone', 'title': '연락처'}
        ];
        //사용자권한에 따른 기능제한
        if($scope.adminPermit) {
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-edit\' ng-click=\"groupUpdateClick('#=_id#')\"></i></button>", 'title': '', 'width': '50px' });
            $scope.kgcolumns.push({'template': "<button class=\'btn btn-small\'><i class=\'icon-remove\' ng-click=\"groupDeleteClick('#=_id#')\"></i></button>", 'title': '', 'width': '50px' });
        }
        var reloadGrid = function (data) {
            console.log('data:' + data);
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            GroupName: {type: "string"},
                            ContactName: {type: "string"},
                            GroupPhone: {type: "string"}
                        }
                    }
                }
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        $scope.name = '';
        $scope.contact = '';
        $scope.address = '';

        //데이터를가져온다
        $scope.$on('zone_get_msg', function (event, data) {
            Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                console.log(callback);
                $scope.name = callback.Name;
                $scope.contact = callback.Contact;
                $scope.address = callback.Address;
                $scope.defaultmonth = callback.DefaultMonth;
                $scope.moneycut = callback.MoneyCut;
                $scope.membershipfee = callback.MembershipFee;
                $scope.defaultpw = callback.DefaultPw;
                $scope.typeData = callback.LoanTypes;
                $scope.useData = callback.LoanUses;
                reloadGrid(callback.Group);
            });
        });
        var findGridData = function (id) {
            // 루프돌며 찾기
            var raw = $scope.kgdatasource.data();
            var length = raw.length;
            var item, i;
            for (i = length - 1; i >= 0; i--) {
                item = raw[i];
                if (item._id === id) {
                    return item;
                }
            }
        }
        //그리드 버튼이벤트
        $scope.groupAddClick = function () {
            $scope.groupDialog.type = 'add';
            $scope.groupDialog.dialog.center().open();
        }
        $scope.groupUpdateClick = function (id) {
            $scope.groupDialog.group = findGridData(id)
            $scope.groupDialog.type = 'update';
            $scope.groupDialog.dialog.center().open();
        }
        $scope.groupDeleteClick = function (id) {
            $scope.groupDialog.group = findGridData(id)
            $scope.groupDialog.type = 'delete';
            $scope.groupDialog.dialog.center().open();
        }
        $scope.groupSubmit = function (type) {
            if (type == 'add') {
                Group.save({code: $scope.$parent.user.ZoneCode}, $scope.groupDialog.group, function success(callback) {
                    console.log("group save");
                }, function error() {
                    console.log("Error: group save");
                })
            }
            if (type == 'update') {
                Group.update({code: $scope.$parent.user.ZoneCode, groupid: $scope.groupDialog.group._id}, $scope.groupDialog.group, function success(callback) {
                    console.log("group update");
                }, function error() {
                    console.log("Error: group update");
                });
            }
            if (type == 'delete') {
                Group.delete({code: $scope.$parent.user.ZoneCode, groupid: $scope.groupDialog.group._id}, function success(callback) {
                    console.log("group delete");
                }, function error() {
                    console.log("Error: group delete");
                });
            }

            $scope.groupDialog.dialog.close();
            $route.reload();
        }
        $scope.groupCancel = function () {
            $route.reload();
            $scope.groupDialog.dialog.close();
        }
        $scope.submit = function () {
            Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
                console.log(callback);
                var zone = callback;
                zone.Name = $scope.name;
                zone.Contact = $scope.contact;
                zone.Address = $scope.address;
                zone.DefaultMonth = $scope.defaultmonth;
                zone.MoneyCut = $scope.moneycut;
                zone.MembershipFee = $scope.membershipfee;
                zone.DefaultPw = $scope.defaultpw;
                zone.LoanTypes = $scope.typeData;
                zone.LoanUses = $scope.useData;
                Zone.update({code: $scope.$parent.user.ZoneCode}, zone, function success(result) {
                    console.log('zone update');
                    $route.reload();
                }, function error() {
                    console.log('Error : zone update');
                    $route.reload();
                })
            })
        }
        $scope.cancel = function () {
            $route.reload();
        }
        //토글버튼
        $scope.tbutton = {
            label: '숨기기',
            active: false
        }
        $scope.$watch('tbutton.active', function (newVal, oldVal) {
            if (newVal == true) {
                $scope.tbutton.label = '숨기기'
            } else {
                $scope.tbutton.label = '보기'
            }
        }, true);
        //////////////////////////////////////// 대출유형 ////////////////////////////////////////
        $scope.addType = function () {
            $scope.typeData.push({LoanType: '이름없음'})
        }
        $scope.deleteType = function () {
            //지우기
            for (var i = 0; i < $scope.typeData.length; i++) {
                if ($scope.typeData[i].LoanType == $scope.typeSelections[0].LoanType) {
                    $scope.typeData.splice(i, 1)
                }
            }
        }
        $scope.typeData = [];
        $scope.typeSelections = [];
        $scope.gridOptionsType = {
            data: 'typeData',
            selectedItems: $scope.typeSelections,
            enableCellSelection: true,
            multiSelect: false,
            enableRowSelection: true,
            enableCellEdit: true,
            columnDefs: [
                {field: 'LoanType', displayName: '대출유형', enableCellEdit: true}
            ]
        };
        //////////////////////////////////////// 대출용도 ////////////////////////////////////////
        $scope.addUse = function () {
            $scope.useData.push({LoanUse: '이름없음'})
        }
        $scope.deleteUse = function () {
            //지우기
            for (var i = 0; i < $scope.useData.length; i++) {
                if ($scope.useData[i].LoanUse == $scope.useSelections[0].LoanUse) {
                    $scope.useData.splice(i, 1)
                }
            }
        }
        $scope.useData = [];
        $scope.useSelections = [];
        $scope.gridOptionsUse = {
            data: 'useData',
            selectedItems: $scope.useSelections,
            enableCellSelection: true,
            multiSelect: false,
            enableRowSelection: true,
            enableCellEdit: true,
            columnDefs: [
                {field: 'LoanUse', displayName: '대출용도', enableCellEdit: true}
            ]
        };
    });
