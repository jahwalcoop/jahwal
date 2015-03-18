'use strict';

angular.module('publicApp')
  .controller('PurchaselistCtrl', function ($scope, headerService, Shareservice, $timeout, $route, $location, Member, Search, Buy, Zone) {
        headerService.saveHeader('admin');

        $scope.buyDialog = {url: 'views/include/buyForm.html', type: 'add', buy: {}, data: {}};

        //http://plnkr.co/edit/MBjO2QBkpDoqDGD2NDR2
        $scope.kgpageable = { 'refresh': false, 'pageSizes': true };
        $scope.kgdatasource = new kendo.data.DataSource({
            pageSize: 20  //set pageSize here. Will be used for client-side paging.
        });
        //http://plnkr.co/edit/8El9nh
        $scope.kgcolumns = [
            {'field': 'StDate', 'template': "#= kendo.toString(kendo.parseDate(StDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '게시일'},
            {'field': 'Subject', 'title': '공동구매 제목', 'width':'150px'},
            {'field': 'Status', 'title': '상태'},
            {'field': 'EdDate', 'template': "#= kendo.toString(kendo.parseDate(EdDate, 'yyyy-MM-dd'),'yyyy-MM-dd')#", 'title': '게시일'},
            {'field': 'GroupName', 'title': '게시자-사업단'},
            {'field': 'Sales', 'title': '총 판매량'},
            {'field': 'Bill', 'template': "#= kendo.toString(Bill, 'n0')#", 'title': '판매금액' ,attributes:{style:"text-align:right;"}},
            {'template': "<button class=\'btn btn-small\'><i class=\'icon-edit\' ng-click=\"updateBtnClick('#=_id#')\"></i></button>", 'title': '', 'width': '50px' },
            {'template': "<button class=\'btn btn-small\'><i class=\'icon-remove\' ng-click=\"deleteBtnClick('#=_id#')\"></i></button>", 'title': '', 'width': '50px' }
        ];

        var reloadGrid = function (data) {
            console.log('data:' + data);
            var d = new kendo.data.DataSource({
                data: data,
                schema: {
                    model: {
                        fields: {
                            No: {type: "number"},
                            Subject: {type: "string"},
                            StDate: {type: "date"},
                            EdDate: {type: "date"},
                            Status: {type: "string"},
                            GroupName: {type: "string"},
                            Sales: {type: "number"},
                            Bill: {type: "number"}
                        }
                    }
                },
                pageSize: 15
            });
            d.read();
            $scope.kgdatasource.data(d.data());
        }

        //데이터를가져온다
        Zone.get({code: $scope.$parent.user.ZoneCode}, function success(callback) {
            console.log(callback);
            $scope.buyDialog.data.ZoneName = callback.Name;
            $scope.ZoneName = callback.Name;
            reloadGrid(callback.Buy);
        })
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
        $scope.addBtnClick = function () {
            $scope.buyDialog.type = 'add';
            $scope.buyDialog.dialog.center().open();
        }
        $scope.updateBtnClick = function (id) {
            $scope.buyDialog.buy = findGridData(id)
            $scope.buyDialog.type = 'update';
            $scope.buyDialog.dialog.center().open();
        }
        $scope.deleteBtnClick = function (id) {
            $scope.buyDialog.buy = findGridData(id)
            $scope.buyDialog.type = 'delete';
            $scope.buyDialog.dialog.center().open();
        }
        $scope.buySubmit = function (type) {
            if (type == 'add') {
                Buy.save({code: $scope.$parent.user.ZoneCode}, $scope.buyDialog.buy, function success(callback) {
                    console.log("buy save");
                }, function error() {
                    console.log("Error: buy save");
                })
            }
            if (type == 'update') {
                Buy.update({code: $scope.$parent.user.ZoneCode, buyid: $scope.buyDialog.buy._id}, $scope.buyDialog.buy, function success(callback) {
                    console.log("buy update");
                }, function error() {
                    console.log("Error: buy update");
                });
            }
            if (type == 'delete') {
                Buy.delete({code: $scope.$parent.user.ZoneCode, buyid: $scope.buyDialog.buy._id}, function success(callback) {
                    console.log("buy delete");
                }, function error() {
                    console.log("Error: buy delete");
                });
            }

            $scope.buyDialog.dialog.close();
            $route.reload();
        }
        $scope.buyCancel = function () {
            $route.reload();
            $scope.buyDialog.dialog.close();
        }

        // 드롭다운리스트 : 상태
        $scope.optStatus = {
            dataSource: {
                data: [
                    { name: "진행중", value: "진행중" },
                    { name: "완료", value: "완료" }
                ]
            },
            dataTextField: "name",
            dataValueField: "value",
            optionLabel: " "
        };
        $scope.selectStatusChange = function (e) {
            console.log(e.sender.value());
            console.log(e.sender.text());
        };
        // 드롭다운리스트 : 사업단
        $scope.group = [];
        $scope.optGroupName = {
            dataSource: {
                data: $scope.$parent.zone.Group
            },
            dataTextField: "GroupName",
            dataValueField: "GroupName",
            optionLabel: " "
        };
  });
