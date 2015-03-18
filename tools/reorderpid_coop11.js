var mongoose = require('mongoose');
var db = require('../routes/model/DB');
var memberData = require('../routes/model/member');
var async = require('async');


var Member = mongoose.model('Member');

function prefixZeros(number, maxDigits) {
    var length = maxDigits - number.toString().length;
    if (length <= 0)
        return number;

    var leadingZeros = new Array(length + 1);
    return leadingZeros.join('0') + number.toString();
}

var reorder = function (zonecode, mode) {
    try {
        async.waterfall([
            function (callback) {
                memberData.list({ZoneCode: zonecode}, function (err, members) {
                    if (members.length != 0) {
                        console.log('result is ' + members.length);
                        for (var i = 0; i < members.length; i++) {
                            var member = members[i];
                            var pid = String(member.Pid);
                            var pidArr = pid.split('0100');
                            var pidNum = Number(pidArr[1]);
                            var pidStr = prefixZeros(pidNum, 6);
                            var pidNew = 'coop11' + '-' + pidStr;
                            member.Pid = pidNew;
                            console.log(zonecode, 'before:', pid, pidNew, member.Name);
                            if (mode != 's') {
                                Member.findOneAndUpdate({_id: member._id }, {Pid: pidNew}, { upsert: true }, function (err, results) {
                                });
                            }
                        }
                    }
                    console.log('result is ' + members.length);
                    callback(null, zonecode)
                });
            },
            function (zonecode, callback) {
                // id값이 주어지면 주어진 ID로 생성
                if (zonecode != undefined) {
                    memberData.list({ZoneCode: zonecode}, function (err, members) {
                        for (var i = 0; i < members.length; i++) {
                            console.log(zonecode, 'after:', members[i].Pid, members[i].Name)
                        }
                        callback(null, null)
                    });
                }
                console.log('zone is ' + zonecode)
            }
        ], function (err, result) {
            console.log('success')
            process.exit(0);
        });
    } catch (e) {
        console.log(e);
        process.exit(0);
    }
}

var zonecode = process.argv[2];
var mode = process.argv[3];

if (zonecode == "-h" || zonecode == "--help" || zonecode == null) {
    console.log("usage : node reoderpid.js [zonecode] [mode]")
    console.log("zonecode를 입력받아 해당 zone에 속해있는 id형식을 6자리로 만듬.")
    console.log("예) coop11-1 -> coop11-000001")
    console.log("mode : s(simulative)")
    process.exit(0);
}

console.log('start reorder',zonecode,"#############################")
reorder(zonecode, mode);

//saveZone.save하기전에 프로세스가 끝나버릴수도...async를 써서 다시 만들어야...
//process.exit(0)
