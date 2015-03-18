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
    this.Phone = val.Contact;
    this.CellPhone = val.Contact;
    this.ZoneCode = val.Code;
    this.ZoneName = val.Name;
    this.ZoneContact = val.Contact;
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
            "ZoneName": val.Name,
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

var create = function (code, customID) {
    try {
        async.waterfall([
            function (callback) {
                zoneData.findByCode(code, function (err, result) {
                    //ZONE이 없으면 error
                    if (result == null) err = new Error('result is null');
                    callback(err, result);
                });
            },
            function (zone, callback) {
                // id값이 주어지면 주어진 ID로 생성
                if (customID != undefined) {
                    var member = new Member(zone);
                    member.Pid = customID;
                    memberData.save(member, function (err, result) {
                        callback(err, member);
                    });
                } else {
                    zoneData.incseq(zone.Code, function (err, func) {
                        var member = new Member(func);
                        member.Pid = func.Code + '-' + func.Seq;
                        memberData.save(member, function (err, result) {
                            callback(err, member);
                        });
                    })
                }
            }
        ], function (err, result) {
            console.log('success')
            process.exit(0);
        });
    } catch (e) {
        res.json({});
    }
}


var codearg = process.argv[2];

if (codearg == "-h" || codearg == "--help" || codearg == null) {
    console.log("usage : node memberadd.js [zonecode] customID")
    process.exit(0);
}

var customID = process.argv[3];

create(codearg, customID);