'use strict';

exports.getLogoutBtn = function() {
    return element(by.css('[ng-click="logout()"]'));
}