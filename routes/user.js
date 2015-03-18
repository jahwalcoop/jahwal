var memberData = require('./model/member');
var async = require('async');

exports.login = function(req, res){

};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
}

//pid는 고유하므로 update시 zone을 참조하지 않는다.
exports.findByPid = function (req, res) {
    var pid = req.params.pid;

    memberData.findByPid(pid, function (err, result) {
        res.json(result);
    });
}

//update할때 member._id를 참조한다.
exports.update = function (req, res) {
    var member = req.body;
    console.log(member.passwordcurrent);
    //user를 찾는다.
    memberData.findByPid(member.Pid, function (err, user) {
        //password를 비교한다.
        user.comparePassword(member.passwordcurrent, function (err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                //새로운 pw가 있을경우 pw를 업데이트한다.
                user.updatePassword(member.passwordnew, function (err, hash) {
                    if (err) return done(err);
                    //passwordnew가 undefined인경우 null을 리턴한다.
                    if(hash != null) {
                        console.log("password changed:"+member.Pid+":"+member.passwordnew);
                        member.Password = hash;
                    }
                    memberData.update(member, function (err, result) {
                        res.json({message:'success'})
                    });
                });
            } else {
                //pw가 맞지않으면 에러메시지를 출력한다.
                res.json({message:'pwerror'});
            }
        });
    });
}