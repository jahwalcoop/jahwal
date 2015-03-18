'use strict';

angular.module('publicApp')
  .controller('PrintconsultlistCtrl', function ($scope,headerService, $location, $dialog, services, $window, $timeout) {
        headerService.saveHeader('none');
        $scope.data = services.getData();
        //화면랜더링 후 출력하기 위해 $timeout을 사용
        $timeout(function () {
            $window.print();
        }, 100);
  });
