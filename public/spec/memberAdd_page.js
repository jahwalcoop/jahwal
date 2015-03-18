'use strict';

exports.GO = function() {
    element(by.linkText('조합원')).click();
    element(by.linkText('신규 조합원 등록')).click();
}

exports.addUser = function(name) {
    element(by.model('member.Name')).sendKeys(name);
    element(by.model('member.Birthday')).sendKeys('2012/10/10');
    element(by.id('CalendarType2')).click();
    element(by.model('member.Address')).sendKeys('기본주소');
    element(by.model('member.Phone')).sendKeys('010-000-0000');
    element(by.model('member.CellPhone')).sendKeys('010-000-0000');
    element(by.id('FundingMethod2')).click();
    element(by.id('MemberType2')).click();

    browser.sleep(100);
    return element(by.id('userSubmit'));
}

exports.completeClick = function() {
    element(by.css('[ng-click="complete()"]')).click();
}

exports.getAddressesBtn = function(dong) {
    //element(by.model('address.token')).sendKeys(dong);
    element(by.css('[ng-click="address.dialog.center().open()"]')).click();
    browser.sleep(1000);
    element(by.model('address.token')).sendKeys(dong);
    return element(by.css('[ng-click="address.search(address.token)"]'));
}