'use strict';

angular.module('publicApp')
  .service('Shareservice', function Shareservice($rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
        var share = {
            prevLocation:"",
            Pid:"",
            Name:""
        };

        return {
            setData:function (data){
                share  = data;
            },
            getData:function (){
                return share;
            }
        };
  });
