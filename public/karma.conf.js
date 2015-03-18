// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/jquery/jquery.min.js',
            "app/bower_components/holderjs/holder.js",
//            "app/bower_components/bootstrap_2.3.2/js/bootstrap.js",
            "app/bower_components/angular/angular.js",
            "app/bower_components/angular-resource/angular-resource.js",
            "app/bower_components/kendo-ui/js/kendo.web.min.js",
            "app/bower_components/angular-kendo-ui/build/angular-kendo.js",
            "app/bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js",
            "app/bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.kr.js",
            "app/bower_components/select2/select2.js",
            "app/bower_components/angular-ui-select2/src/select2.js",
            "app/bower_components/angular-ui/build/angular-ui.js",
            "app/bower_components/bootstrap-gh-pages/ui-bootstrap-0.5.0.js",
            "app/bower_components/bootstrap-gh-pages/ui-bootstrap-tpls-0.5.0.js",
            "app/bower_components/angular-grid/ng-grid-2.0.7.min.js",
            "app/bower_components/angular-i18n/angular-locale_ko-kr.js",
            "app/bower_components/angular-resource/angular-resource.js",
            "app/bower_components/angular-cookies/angular-cookies.js",
            "app/bower_components/angular-sanitize/angular-sanitize.js",
            "app/bower_components/angular-route/angular-route.js",
            "app/bower_components/angular-http-auth/src/http-auth-interceptor.js",
            "app/bower_components/angular-strap/dist/angular-strap.min.js",
            'app/scripts/*.js',
            'app/scripts/**/*.js',
            'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 9876,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
