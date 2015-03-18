'use strict';

angular.module('publicApp')
  .controller('PurchaseaddCtrl', function ($scope, headerService, $location, $dialog) {
        headerService.saveHeader('admin');
  });
