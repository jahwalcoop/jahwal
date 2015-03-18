'use strict';

exports.GO = function() {
    element(by.linkText('조합원')).click();
    element(by.linkText('총계/누계 조회')).click();
}

exports.getSubmitBtn = function() {
    return element(by.css('[ng-click="submit()"]'));
}