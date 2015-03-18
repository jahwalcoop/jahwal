'use strict';

exports.login = function(id,password) {
        element(by.model('pid')).sendKeys(id);
        element(by.model('password')).sendKeys(password);

        var submitLogin = element(by.id('submitLogin'));
        return submitLogin;
}

exports.getVersion = function(id,password) {
    browser.get('#/login');

    var ver = element(by.binding('ver'));
    browser.sleep(1000);
    return ver;
}
