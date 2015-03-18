var mongoose = require('mongoose');
var db = require('../routes/model/DB');
var zoneData = require('../routes/model/zone');
var memberData = require('../routes/model/member');
var async = require('async');
var fs = require('fs');

function Member(val) {
    this.Pid = '';
    this.Name = '관리자';
    this.Password = 1234;
    this.Birthday = new Date();
    this.CalendarType = '양력';
    this.Address = val.Address;
    this.Phone = val.Phone;
    this.CellPhone = val.CellPhone;
    this.ZoneCode = val.ZoneCode;
    this.ZoneName = val.ZoneName;
    this.ZoneContact = val.ZoneContact;
    this.RegDate = new Date();
    this.MemberType = '기타';
    this.MemberClass = '실무자';
    this.Fee = 0;
    this.Note = '없음';
    this.Status = '활동중';
    this.FundingMethod = '수시출자';
    this.PromisedMoney = 0;
    this.GroupName = '';
    this.GroupPhone = '';
    this.Fund = [
        {
            "ZoneName": "",
            "DepositDate": new Date(),
            "Method": "수시출자",
            "Money": 0
        }
    ];
    this.Loan = [
        {
            "LoanDate": new Date(),
            "LoanExpDate": new Date(),
            "LoanPeriod": "0",
            "LoanRate": 10,
            "LoanType": "임의상환",
            "LoanUse": "기타",
            "Principal": 0,
            "Repay": [
                {
                    "RepayDate": new Date(),
                    "Payment": 0,
                    "Interest": 0
                }
            ]
        }
    ];
}

var update = function (pid, password) {
    try {
        async.waterfall([
            function (callback) {
                memberData.findByPid(pid.toUpperCase(), function (err, user) {
                    var member = Object.create(user);
                    callback(err, user, member);
                });
            },
            function (user, member, callback) {
                user.updatePassword(password, function (err, hash) {
                    if (err) return err;
                    if (hash != null) {
                        member.Password = hash;
                        member.MemberType = "ahfk"
                        console.log(member.Password);
                        var me = new Member(member);
                        me.Pid = member.Pid;
                        me.Password = hash;
                        callback(err, me);
                    } else {
                        console.log('no hash');
                        return;
                    }

                });
            },
            function (member, callback) {
                var Member = mongoose.model('Member');

                var id = member._id;
                delete member._id;
                member.MemberType = "ahfk"
                Member.update({_id: id}, member, {upsert: true}, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err, member.Pid)
                    }
                });
            },
            function (pid, callback) {
                memberData.findByPid(pid.toUpperCase(), function (err, mmm) {
                    console.log(mmm);
                    callback(err, mmm);
                })
            }

        ], function (err, result) {
            console.log('success')
            process.exit(0);
        });
    } catch (e) {
        res.json({});
    }
}

var pidarg = process.argv[2];
var passwordarg = process.argv[3];

if (pidarg == "-h" || pidarg == "--help" || pidarg == null || passwordarg == null) {
    console.log("비밀번호 초기화")
    console.log("usage : node memberpw.js [pid] [new password]")
    process.exit(0);
}

update(pidarg, passwordarg);