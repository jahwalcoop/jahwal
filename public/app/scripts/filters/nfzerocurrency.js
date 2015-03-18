'use strict';

angular.module('publicApp')
  .filter('nfzerocurrency', [ '$filter', '$locale', function ($filter, $locale) {
        var currency = $filter('currency'), formats = $locale.NUMBER_FORMATS;
        return function (amount, symbol) {
            var value = currency(amount, symbol);
            var ret = value.replace(new RegExp('\\' + formats.DECIMAL_SEP + '\\d{2}'), '')
            if(ret == '₩0') {
                ret = '';
            }
            return ret;
        }
    }])