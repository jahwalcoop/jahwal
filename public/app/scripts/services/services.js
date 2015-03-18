'use strict';

angular.module('publicApp')
  .service('services', function services() {
    // AngularJS will instantiate a singleton by calling "new" on this function
        var share = {};

        return {
            setData:function (data){
                share  = data;
            },
            getData:function (){
                return share;
            }
        };
  });

