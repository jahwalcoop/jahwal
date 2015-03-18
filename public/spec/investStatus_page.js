'use strict';

exports.GO = function() {
    element(by.linkText('출자금')).click();
    element(by.linkText('개인출자신청 조회')).click();
}