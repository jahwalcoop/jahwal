'use strict';
var memberStatusPage = require('./memberStatus_page.js');
var memberSearchPage = require('./memberSearch_page.js');
var memberAddPage = require('./memberAdd_page.js');

describe('조합원 추가 : ', function () {
//    it('사용자추가', function () {
//        memberAddPage.GO();
//        var userSubmit = memberAddPage.addUser('김길동');
//        userSubmit.click().then(function () {
//            browser.waitForAngular();
//            browser.sleep(100);
//        });
//        memberAddPage.completeClick();
//    }, 30000);
// TODO: Kendo grid의 modal을 protractor에서 인식하지 못한다.방법을 찾으라.
    it('주소검색', function () {
        memberAddPage.GO();
        memberAddPage.getAddressesBtn('문화동').click().then(function () {
            element(by.repeater('addr in address.data').column('addr.Address')).then(function (arr) {
                expect(arr.getText()).not.toBe(0);
            });
        });
    }, 30000);
});

//describe('조합원 검색 : ', function () {
//    it('총계검증', function () {
//        memberSearchPage.GO();
//        var submitBtn = memberSearchPage.getSubmitBtn();
//        submitBtn.click().then(function () {
//            browser.waitForAngular();
//            var allSum = element(by.id('allSum'));
//            var totalSum = element(by.id('totalSum'));
//            expect(allSum.getText()).not.toBeNull();
//            expect(allSum.getText()).not.toBeUndefined();
//            expect(allSum.getText()).toBeGreaterThan(0);
//            expect(totalSum.getText()).not.toBeGreaterThan(allSum.getText());
//        });
//    }, 30000);
//});
//
//describe('조합원 상태 : ', function () {
//    it('user가 몇명인가?', function () {
//        memberStatusPage.GO();
//        var memberCnt = memberStatusPage.getMemberCnt();
//        expect(memberCnt.getText()).not.toBeNull();
//        browser.sleep(1000);
//    }, 30000);
//});
