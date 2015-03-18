'use strict';

exports.GO = function() {
    element(by.linkText('출자금')).click();
    element(by.linkText('총계/누계 조회')).click();
}