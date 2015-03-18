'use strict';

exports.GO = function() {
    element(by.linkText('조합원')).click();
    element(by.linkText('조합원 정보 조회')).click();
}

exports.getMemberCnt = function(name) {
    element(by.css('[ng-click="fnsearch(memberstatus)"]')).click();
    var memberCnt = element(by.id('memberCnt'));
    return memberCnt;
}