
/**
 * Module dependencies.
 */

var express = require('express')
    , db = require('./routes/model/DB')
    , routes = require('./routes')
    , user = require('./routes/user')
    , member = require('./routes/member')
    , fund = require('./routes/fund')
    , loan = require('./routes/loan')
    , repay = require('./routes/repay')
    , zone = require('./routes/zone')
    , summary = require('./routes/summary')
    , address = require('./routes/address')
    , http = require('http')
    , path = require('path');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname+'/views/jahwalfav.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(flash());
require('./routes/passport')(app);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var auth = require('./middlewares/authorization');
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/login',
    passport.authenticate('local', {failureFlash:true}),
    function (req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
//        res.redirect('/users/' + req.user.username);
//        console.log(req.user);
        res.json(req.user);
    });

var adminAuth = [auth.requiresLogin, auth.admin.hasAuthorization];
var loginAuth = [auth.requiresLogin];

//var adminAuth = [auth.freepass];
//var loginAuth = [auth.freepass];


app.get('/logout', user.logout);
app.get('/account', auth.requiresLogin, function(req, res){
    //로그인 되어있는지 확인하기위한 코드
    res.json(req.user);
});
//시스템 버전 : 클라이언트코드를 업데이트 시키는데 사용
app.get('/version', function(req, res){
    res.json({version:"1.0.13"});
});

//member CRUD
//C - Create
//R - Read
//U - Update
//D - Delete
app.get('/api/member', adminAuth, member.list);
app.put('/api/member', adminAuth, member.save);
app.get('/api/member/:pid', adminAuth, member.findByPid);
app.put('/api/member/:pid', adminAuth, member.partial_update);
app.del('/api/member/:pid', adminAuth, member.delete);
//member count
app.get('/api/count/:zone', adminAuth, member.count);
app.get('/api/summary/member/:zone/:group', adminAuth, member.summary);
app.get('/api/summary/fund/:zone/:group', adminAuth, fund.fundActive);
app.get('/api/summary/dailymoney', adminAuth, summary.dailymoney);
app.get('/api/dashboard/all/:zone', adminAuth, member.dashboard);
app.get('/api/dashboard/loan/:zone', adminAuth, member.loanSumZone);
app.get('/api/dashboard/repay/:zone', adminAuth, member.repaySumZone);
app.get('/api/dashboard/fund/:zone', adminAuth, member.fundSumZone);
app.get('/api/search/member/:zone', adminAuth, member.search);
//loan
//TODO: 관리자와 일반사용자의 api를 분리해야한다.
app.get('/api/member/:pid/loan', loginAuth, loan.list);
app.put('/api/member/:pid/loan', adminAuth, loan.save);
app.put('/api/member/:pid/loan/:loanid', adminAuth, loan.update);
app.del('/api/member/:pid/loan/:loanid', adminAuth, loan.delete);
//repay
app.get('/api/member/:pid/loan/:loanid/repay', loginAuth, repay.list);
app.put('/api/member/:pid/loan/:loanid/repay', adminAuth, repay.save);
app.put('/api/member/:pid/loan/:loanid/repay/:repayid', adminAuth, repay.update);
app.del('/api/member/:pid/loan/:loanid/repay/:repayid', adminAuth, repay.delete);
//fund
app.get('/api/member/:pid/fund', fund.fundList);
app.put('/api/member/:pid/fund', adminAuth, fund.save);
app.put('/api/member/:pid/fund/:fundid', adminAuth, fund.update);
app.del('/api/member/:pid/fund/:fundid', adminAuth, fund.delete);
//fund Summary
app.get('/api/fund/all/:zone', adminAuth, fund.fundAll);
app.get('/api/fund/list/:pid', loginAuth, fund.fundList);
app.get('/api/fund/sum/:pid', loginAuth, fund.fundSum);
//zone CRUD
app.get('/api/zone', adminAuth, zone.list);
app.get('/api/zone/:code', loginAuth, zone.findByCode);
app.put('/api/zone/:code', adminAuth, zone.update);
//zone method
app.get('/api/getseq/:code', adminAuth, zone.getseq);
//group method
app.get('/api/zone/:code/group', adminAuth, zone.grouplist);
app.put('/api/zone/:code/group', adminAuth, zone.groupsave);
app.put('/api/zone/:code/group/:groupid', adminAuth, zone.groupupdate);
app.del('/api/zone/:code/group/:groupid', adminAuth, zone.groupdelete);
//address
app.get('/api/address/create', adminAuth, address.save);
app.get('/api/address', loginAuth, address.list);
//buy method
app.get('/api/zone/:code/buy', adminAuth, zone.buylist);
app.put('/api/zone/:code/buy', adminAuth, zone.buysave);
app.put('/api/zone/:code/buy/:buyid', adminAuth, zone.buyupdate);
app.del('/api/zone/:code/buy/:buyid', adminAuth, zone.buydelete);
//좌수 가져오기
app.get('/api/zone/:code/moneycut', loginAuth, zone.moneycut);
//user CRUD
app.get('/api/user/:pid', loginAuth, user.findByPid);
app.put('/api/user/:pid', loginAuth, user.update);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
