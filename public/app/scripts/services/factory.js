'use strict';

var myModule = angular.module('publicAppService', ['ngResource', 'http-auth-interceptor']);

myModule.factory('Address', function ($resource) {
    return $resource('/api/address', {}, {
        list: {method: 'GET', isArray: true}
    });
});

myModule.factory('User', function ($resource) {
    return $resource('/api/user/:pid', {pid: '@pid'}, {
        get: {method: 'GET', isArray: false},
        update: {method: 'PUT', params: {pid: '@pid'}, isArray: false}
    });
});

myModule.factory('Auth', function ($resource) {
    return $resource('/:action', {action: '@action'}, {
        login: {method: 'POST', params: {action: 'login'}},
        logout: {method: 'GET', params: {action: 'logout'}, isArray: false}
    });
});

myModule.factory('Member', function ($resource) {
    return $resource('/api/member/:pid', {pid: '@pid'}, {
        query: {method: 'GET', isArray: true},
        get: {method: 'GET', isArray: false},
        post: {method: 'POST'},
        create: {method: 'PUT', isArray: false},
        update: {method: 'PUT', params: {pid: '@pid'}, isArray: false},
        remove: {method: 'DELETE', params: {pid: '@pid'}}
    });
});

myModule.factory('Zone', function ($resource) {
    return $resource('/api/zone/:code/:field', {code: '@code',field: '@field'}, {
        list: {method: 'GET', isArray: true},
        get: {method: 'GET', params: {code: '@code'}, isArray: false},
        update: {method: 'PUT', params: {code: '@code'}},
        moneycut: {method: 'GET', params: {code: '@code',field: 'moneycut'},isArray: false}
    });
});

myModule.factory('Group', function ($resource) {
    return $resource('/api/zone/:code/group/:groupid', {code: '@code',groupid:'@groupid'}, {
        list: {method: 'GET', params: {code: '@code'}, isArray: true},
        save: {method: 'PUT', params: {code: '@code'}},
        update: {method: 'PUT', params: {code: '@code',groupid:'@groupid'}},
        delete: {method: 'DELETE', params: {code: '@code',groupid:'@groupid'}}
    });
});

myModule.factory('Buy', function ($resource) {
    return $resource('/api/zone/:code/buy/:buyid', {code: '@code',buyid:'@buyid'}, {
        list: {method: 'GET', params: {code: '@code'}, isArray: true},
        save: {method: 'PUT', params: {code: '@code'}},
        update: {method: 'PUT', params: {code: '@code',groupid:'@buyid'}},
        delete: {method: 'DELETE', params: {code: '@code',groupid:'@buyid'}}
    });
});


myModule.factory('Summary', function ($resource) {
    return $resource('/api/summary/:action/:zone/:group', {zone: '@zone',group: '@group'}, {
        member: {method: 'GET', params: {action: 'member', zone: '@zone', group: '@group'}, isArray: true},
        fund: {method: 'GET', params: {action: 'fund', zone: '@zone', group: '@group'}, isArray: false}
    });
});

myModule.factory('Search', function ($resource) {
    return $resource('/api/search/:action/:zone', {zone: '@zone'}, {
        memberlist: {method: 'GET', params: {action: 'member', zone: '@zone'}, isArray: true}
    });
});

myModule.factory('Dashboard', function ($resource) {
    return $resource('/api/dashboard/:action/:zone', {zone: '@zone'}, {
        query: {method: 'GET', params: {action: 'all', zone: '@zone'}, isArray: true},
        loan: {method: 'GET', params: {action: 'loan', zone: '@zone'}, isArray: false},
        repay: {method: 'GET', params: {action: 'repay', zone: '@zone'}, isArray: false},
        fund: {method: 'GET', params: {action: 'fund', zone: '@zone'}, isArray: false}
    });
});

myModule.factory('Fund', function ($resource) {
    return $resource('/api/member/:pid/fund/:fundid', {fundid: '@fundid', pid: '@pid'}, {
        list: {method: 'GET', params: {zone: 'ALL', pid: '@pid'}, isArray: false},
        save: {method: 'PUT', params: {zone: 'ALL', pid: '@pid'}, isArray: false},
        update: {method: 'PUT', params: {fundid: '@fundid', zone: 'ALL', pid: '@pid'}, isArray: false},
        delete: {method: 'DELETE', params: {fundid: '@fundid', zone: 'ALL', pid: '@pid'}, isArray: false}
    });
});

myModule.factory('FundSummary', function ($resource) {
    return $resource('/api/fund/:action/:pid/:zone', {action: '@action', pid: '@pid'}, {
        list: {method: 'GET', params: {action: 'list', pid: '@pid'}, isArray: false},
        sum: {method: 'GET', params: {action: 'sum', pid: '@pid'}, isArray: false},
        all: {method: 'GET', params: {action: 'all', zone: '@zone'}, isArray: true},
        active: {method: 'GET', params: {action: 'active', zone: '@zone'}, isArray: true}
    });
});

//TODO:관리자와 일반사용자의 api를 분리해야한다.
myModule.factory('Loan', function ($resource) {
    return $resource('/api/member/:pid/loan/:loanid', {loanid: '@loanid', pid: '@pid'}, {
        list: {method: 'GET', params: {pid: '@pid'}, isArray: true},
        save: {method: 'PUT', params: {pid: '@pid'}, isArray: false},
        update: {method: 'PUT', params: {loanid: '@loanid', pid: '@pid'}, isArray: false},
        delete: {method: 'DELETE', params: {loanid: '@loanid', pid: '@pid'}, isArray: false}
    });
});

myModule.factory('Repay', function ($resource) {
    return $resource('/api/member/:pid/loan/:loanid/repay/:repayid', {pid: '@pid'}, {
        list: {method: 'GET', params: {pid: '@pid', loanid: '@loanid'}, isArray: false},
        save: {method: 'PUT', params: {pid: '@pid', loanid: '@loanid'}, isArray: false},
        update: {method: 'PUT', params: {pid: '@pid', loanid: '@loanid', repayid: '@repayid'}, isArray: false},
        remove: {method: 'DELETE', params: {pid: '@pid', loanid: '@loanid', repayid: '@repayid'}, isArray: false}
    });
});


