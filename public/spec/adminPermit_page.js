'use strict';

exports.GO = function() {
    element(by.linkText('관리자설정')).click();
    element(by.linkText('조합원 권한설정')).click();
}
