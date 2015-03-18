'use strict';

exports.GO = function() {
    element(by.linkText('관리자설정')).click();
    element(by.linkText('우리지역 관련설정')).click();
}