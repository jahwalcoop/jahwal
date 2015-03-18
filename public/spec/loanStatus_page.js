'use strict';

exports.GO = function() {
    element(by.linkText('대출금')).click();
    element(by.linkText('개인대출현황 조회')).click();
}