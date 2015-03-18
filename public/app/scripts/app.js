'use strict';

var app = angular.module('publicApp', ['publicAppService', 'kendo.directives', '$strap.directives', 'ui.select2', 'ui.bootstrap', 'ngCookies', 'http-auth-interceptor', 'ngRoute', 'ngGrid'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/main', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                pageKey: 'PURCHASE'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                pageKey: 'none'
            })
            .when('/investSearch', {
                templateUrl: 'views/investSearch.html',
                controller: 'InvestSearchCtrl',
                pageKey: 'none'
            })
            .when('/investAdd', {
                templateUrl: 'views/investAdd.html',
                controller: 'InvestAddCtrl',
                pageKey: 'none'
            })
            .when('/investStatus', {
                templateUrl: 'views/investStatus.html',
                controller: 'InvestStatusCtrl'
            })
            .when('/investAddDetail', {
                templateUrl: 'views/investAddDetail.html',
                controller: 'InvestAddDetailCtrl'
            })
            .when('/investStatusDetail', {
                templateUrl: 'views/investStatusDetail.html',
                controller: 'InvestStatusDetailCtrl'
            })
            .when('/investStatusDetail', {
                templateUrl: 'views/investStatusDetail.html',
                controller: 'InvestStatusDetailCtrl'
            })
            .when('/memberSearch', {
                templateUrl: 'views/memberSearch.html',
                controller: 'MemberSearchCtrl'
            })
            .when('/memberAdd', {
                templateUrl: 'views/memberAdd.html',
                controller: 'MemberAddCtrl'
            })
            .when('/memberStatus', {
                templateUrl: 'views/memberStatus.html',
                controller: 'MemberStatusCtrl'
            })
            .when('/loanSearch', {
                templateUrl: 'views/loanSearch.html',
                controller: 'LoanSearchCtrl'
            })
            .when('/loanAdd', {
                templateUrl: 'views/loanAdd.html',
                controller: 'LoanAddCtrl'
            })
            .when('/loanStatus', {
                templateUrl: 'views/loanStatus.html',
                controller: 'LoanStatusCtrl'
            })
            .when('/consultList', {
                templateUrl: 'views/consultList.html',
                controller: 'ConsultlistCtrl'
            })
            .when('/disburseList', {
                templateUrl: 'views/disburseList.html',
                controller: 'DisburselistCtrl'
            })
            .when('/costList', {
                templateUrl: 'views/costList.html',
                controller: 'CostlistCtrl'
            })
            .when('/loanStatusDetail', {
                templateUrl: 'views/loanStatusDetail.html',
                controller: 'LoanstatusdetailCtrl'
            })
            .when('/adminLocal', {
                templateUrl: 'views/adminLocal.html',
                controller: 'AdminlocalCtrl'
            })
            .when('/adminPermit', {
                templateUrl: 'views/adminPermit.html',
                controller: 'AdminpermitCtrl'
            })
            .when('/purchaseList', {
                templateUrl: 'views/purchaseList.html',
                controller: 'PurchaselistCtrl'
            })
            .when('/purchaseAdd', {
                templateUrl: 'views/purchaseAdd.html',
                controller: 'PurchaseaddCtrl'
            })
            .when('/memberDetail', {
                templateUrl: 'views/memberDetail.html',
                controller: 'MemberdetailCtrl'
            })
            .when('/memberBan', {
                templateUrl: 'views/memberBan.html',
                controller: 'MemberbanCtrl'
            })
            .when('/userView', {
                templateUrl: 'views/userView.html',
                controller: 'UserviewCtrl'
            })
            .when('/userUpdate', {
                templateUrl: 'views/userUpdate.html',
                controller: 'UserupdateCtrl'
            })
            .when('/userLoanStatus', {
                templateUrl: 'views/userLoanStatus.html',
                controller: 'UserloanstatusCtrl'
            })
            .when('/userInvestStatus', {
                templateUrl: 'views/userInvestStatus.html',
                controller: 'UserinveststatusCtrl'
            })
            .when('/memberAll', {
                templateUrl: 'views/memberAll.html',
                controller: 'MemberallCtrl'
            })
            .when('/memberAddAll', {
                templateUrl: 'views/memberAddAll.html',
                controller: 'MemberaddallCtrl'
            })
            .when('/printConsultList', {
                templateUrl: 'views/printConsultList.html',
                controller: 'PrintconsultlistCtrl'
            })
            .when('/printDisburseList', {
                templateUrl: 'views/printDisburseList.html',
                controller: 'PrintdisburselistCtrl'
            })
            .when('/printCostList', {
                templateUrl: 'views/printCostList.html',
                controller: 'PrintcostlistCtrl'
            })
            .when('/notice/:type', {
                templateUrl: 'views/notice.html',
                controller: 'NoticeCtrl'
            })
            .when('/investPayment', {
              templateUrl: 'views/investPayment.html',
              controller: 'InvestpaymentCtrl'
            })
            .when('/printInvestStatus', {
              templateUrl: 'views/printInvestStatus.html',
              controller: 'PrintinveststatusCtrl'
            })
            .when('/printMemberAdd', {
              templateUrl: 'views/printMemberAdd.html',
              controller: 'PrintmemberaddCtrl'
            })
            .when('/printMemberBan', {
              templateUrl: 'views/printMemberBan.html',
              controller: 'PrintmemberbanCtrl'
            })
            .otherwise({
                redirectTo: '/main'
            });
    }).run(function ($rootScope, $http, $route, $location, $timeout) {
        $rootScope.$on("$routeChangeSuccess",
            function (angularEvent, currentRoute, previousRoute) {

                var pageKey = currentRoute.pageKey;
                console.log('pagekey:' + pageKey);
//                $(".pagekey").toggleClass("active", false);
//                $(".pagekey_" + pageKey).toggleClass("active", true);
            });
        $rootScope.record = 0;

        $rootScope.$on('event:auth-loginRequired', function () {
            console.log('401 error');
            $location.path('/login');
            $rootScope.$broadcast('event:auth-failed');
        });

        $http.get('/version').success(function (callback) {
            $rootScope.version = callback.version;
            console.log('SYSTEM VERSION:'+$rootScope.version);
        });

        $rootScope.$on('event:versionUp-refresh', function () {
            window.location.reload();
        });
    });

//for angular-strap
app.value('$strapConfig', {
    datepicker: {
        language: 'kr',
        format: 'yyyy/mm/dd'
    }
});