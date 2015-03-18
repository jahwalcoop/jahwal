'use strict';
var purchaseListPage = require('./purchaseList_page.js');
var headerPage = require('./header_page.js');

describe('공동구매 : ', function () {
    it('공동구매목록', function () {
        purchaseListPage.GO();
    });
});


describe('로그아웃 : ', function () {
    it('로그아웃후 login으로 이동하는가?', function () {
        var logoutBtn = headerPage.getLogoutBtn();
        logoutBtn.click().then(function () {
            browser.waitForAngular();
            browser.sleep(1000);
            browser.getCurrentUrl().then(function (url) {
                expect(url).toEqual(browser.baseUrl + '#/login');
            })
        });
    }, 30000);
});