/*global describe, expect, it*/
'use strict';
var loginPage = require('./login_page.js');

//describe('로그인페이지 : ', function () {
//    it('버전을 가져오는가?', function () {
//        var ver = loginPage.getVersion();
//        expect(ver.getText()).not.toBeNull();
//    }, 30000);
//
//    it('로그인후 memberSearch로 이동하는가?', function () {
//        var submitLogin = loginPage.login('coop1-4','1234');
//        submitLogin.click().then(function() {
//            browser.waitForAngular();
//            browser.sleep(1000);
//            browser.getCurrentUrl().then(function(url){
//                expect(url).toEqual(browser.baseUrl+'#/memberSearch');
//            })
//        });
//    }, 30000);
//});
