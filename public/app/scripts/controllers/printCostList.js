'use strict';

angular.module('publicApp')
    .controller('PrintcostlistCtrl', function ($scope, headerService, $location, $dialog, Shareservice, $window, services, $timeout) {
        headerService.saveHeader('none');
        $scope.data = services.getData();
        //화면랜더링 후 출력하기 위해 $timeout을 사용
        $timeout(function () {
            $window.print();
        }, 100);
        function Item(type) {
            this.name = '';
            this.type = type; //0,1,2,3,4,5
            this.num = 0;
            this.carryover = 0;
            this.inprice = 0;
            this.outprice = 0;
            this.balance = 0;
            this.subItem = [];
        }

        function dataClass(num, data) {
            this.Class1 = data.class1;
            this.Class2 = data.class2;
            this.Class3 = data.class3;
            this.Class4 = data.class4;
            this.Type = data.type;
            this.Price = data.price;
        }

        var preSearch = function (item, type, data) {
            if (type == 5)
                return 5 - type;

            var find = false;
            var current = null;

            for (var i = 0; i < item.subItem.length; i++) {
                if (item.subItem[i].name == data['Class' + type]) {
                    current = item.subItem[i];
                }
            }
            if (current != null) {
                return preSearch(current, type + 1, data);
            } else {
                return 5 - type;
            }

        }

        var itemSearch = function (item, level, searchnum, data, type) {
            if (level == 5)
                return;

            var find = false;
            var current;
            for (var i = 0; i < item.subItem.length; i++) {
                if (item.subItem[i].name == data['Class' + level]) {
                    current = item.subItem[i];
                    //찾았으면 연번을 올린다.
                    current.num += searchnum;
                    current.carryover += Number(data['Carryover']);
                    current.balance += Number(data['Price']) + Number(data['Carryover']);
                    if (type == 'in') {
                        current.inprice += Number(data['Price']);
                    } else {
                        current.outprice += Number(data['Price']);
                    }
                    find = true;
                    break;
                }
            }
            //찾지못했으면 연번을 올리고 새로만든다.
            if (find == false) {
                current = new Item(level);
                current.num = 5 - level;
                current.name = data['Class' + level];
                current.carryover = Number(data['Carryover']);
                current.balance = Number(data['Price']) + Number(data['Carryover']);
                if (type == 'in') {
                    current.inprice = Number(data['Price']);
                } else {
                    current.outprice = Number(data['Price']);
                }

                item.subItem.push(current);
            }
            //다음것을 순회한다.
            itemSearch(current, level + 1, searchnum, data, type);
        }

        var pushto = function (item, level, bowl) {
            if (level == 5)
                return;

            var searched = false;
            for (var i = 0; i < item.subItem.length; i++) {
                var current = item.subItem[i];
                bowl.push(current);
                pushto(current, level + 1, bowl);
            }
        }

        var sumItem = function (item,bowl) {
            for (var i = 0; i < item.subItem.length; i++) {
                item.carryover += item.subItem[i].carryover;
                item.inprice += item.subItem[i].inprice;
                item.outprice += item.subItem[i].outprice;
                item.balance += item.subItem[i].balance;
            }
            bowl.push(item);
        }
        var totalItem = function (initem, outitem, total, bowl) {
            total.carryover = initem.carryover - outitem.carryover;
            total.inprice = initem.inprice - outitem.inprice;
            total.outprice = initem.outprice - outitem.outprice;
            total.balance = initem.balance - outitem.balance;

            bowl.push(total);
        }
        $scope.calcArr = [];
        $scope.bowl = [];
        $scope.$watch('data', function (newVal, oldVal) {
            if (newVal) {
                var indata = newVal.indata;
                var outdata = newVal.outdata;
                //노드준비
                var innode = new Item(0);
                innode.name = '세입합계';
                var outnode = new Item(0);
                outnode.name = '세출합계';
                var total = new Item(30);
                total.name = "총합계"
                //세입계산
                for (var i = 0; i < indata.length; i++) {
                    var data = indata[i];

                    //몇단계에서 찾아지는지 체크한다.
                    var searchnum = preSearch(innode, 1, data);
                    //항목이 모두 같으면 무시한다.
                    if (searchnum == 0)
                        continue;
                    //해당 단계의 번호를 넣는다.
                    itemSearch(innode, 1, searchnum, data, 'in')
                }
                //세출계산
                for (var i = 0; i < outdata.length; i++) {
                    var data = outdata[i];

                    //몇단계에서 찾아지는지 체크한다.
                    var searchnum = preSearch(outnode, 1, data);
                    //항목이 모두 같으면 무시한다.
                    if (searchnum == 0)
                        continue;
                    //해당 단계의 번호를 넣는다.
                    itemSearch(outnode, 1, searchnum, data, 'out')
                }
                //출력준비
                pushto(innode, 1, $scope.bowl);
                sumItem(innode, $scope.bowl);
                pushto(outnode, 1, $scope.bowl);
                sumItem(outnode, $scope.bowl);
                totalItem(innode, outnode, total, $scope.bowl);
            }
        });
    });
