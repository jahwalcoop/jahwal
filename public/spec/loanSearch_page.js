'use strict';

exports.GO = function() {
    element(by.linkText('대출금')).click();
    element(by.linkText('총계/누계 조회')).click();
}