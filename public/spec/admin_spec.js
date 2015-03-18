'use strict';
var adminLocalPage = require('./adminLocal_page.js');
var adminPermitPage = require('./adminPermit_page.js');
var loginPage = require('./login_page.js');

describe('로그인페이지 : ', function () {
    it('버전을 가져오는가?', function () {
        var ver = loginPage.getVersion();
        expect(ver.getText()).not.toBeNull();
    }, 30000);

    it('로그인후 memberSearch로 이동하는가?', function () {
        var submitLogin = loginPage.login('coop1-4','1234');
        submitLogin.click().then(function() {
            browser.waitForAngular();
            browser.sleep(1000);
            browser.getCurrentUrl().then(function(url){
                expect(url).toEqual(browser.baseUrl+'#/memberSearch');
            })
        });
    }, 30000);
});

//describe('관리자설정 : ', function () {
//    it('우리지역관련설정', function () {
//        adminLocalPage.GO();
//    });
//    it('조합원권한설정', function () {
//        adminPermitPage.GO();
//    });
//});
