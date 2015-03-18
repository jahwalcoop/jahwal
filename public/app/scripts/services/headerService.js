'use strict';

angular.module('publicApp')
    .service('headerService', function headerService($rootScope, $http) {
        return {
            saveHeader: function (data) {
                $rootScope.$broadcast('header_message', data); //admin,user,none
            },
            getHeader: function () {
                return header;
            }
        };
    });
