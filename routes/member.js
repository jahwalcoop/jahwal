var memberData = require('./model/member');
var memberRemovedData = require('./model/memberRemoved');
var zoneData = require('./model/zone');
var async = require('async');
var xlsx = require('node-xlsx');
var moment = require('moment');

function prefixZeros(number, maxDigits) {
    var length = maxDigits - number.toString().length;
    if (length <= 0)
        return number;

    var leadingZeros = new Array(length + 1);
    return leadingZeros.join('0') + number.toString();
}

Date.prototype.valid = function () {
    return isFinite(this);
}

//pid인 사용자를 백업하고 member에서 삭제한다.
exports.delete = function (req, res) {
    var pid = req.params.pid;

    async.waterfall([
        function (callback) {
            //항목이 있는지 쿼리
            memberData.findByPid(pid, function (err, result) {
                callback(err, result);
            });
        },
        function (result, callback) {
            if (result) {
                //관리자인경우 삭제하지 않음
                if (result.MemberClass == '관리자') {
                    callback(null, false);
                } else {
                    delete result._id;
                    memberRemovedData.save(result, function (err, result) {
                        callback(null, 'saved Pid:' + pid);
                    });
                }
            } else {
                callback(null, false);
            }
        },
        function (result, callback) {
            if (result) {
                memberData.delete(pid, function (err, result) {
                    callback(null, 'delected Pid:' + pid);
                });
            } else {
                callback(null, 'error');
            }
        }
    ], function (err, result) {
        res.json({msg: result})
    });
}

exports.list = function (req, res) {
    var zone = req.params.zone;
    var cond = {};

    memberData.list(cond, function (err, result) {
        res.json(result);
});
}

function ExportMember() {
    this.name = '';
    this.getFileName = function () {
        return "member(" + this.name + ").xlsx";
    }
    this.generate = function (result) {
        var data = [];
        data.push(["개인고유번호", "이름", "생년월일", "가입일", "사업단", "상태", "증자", "감자"]);
        for (var i = 0; i < result.length; i++) {
            var item = result[i];
            var birthday = moment(item.Birthday).format('YYYY/MM/DD');
            var regdate = moment(item.RegDate).format('YYYY/MM/DD');
            var val = [
                {"value": item.Pid, "formatCode": "General"},
                {"value": item.Name, "formatCode": "General"},
                {"value": birthday, "formatCode": "General"},
                {"value": regdate, "formatCode": "General"},
                {"value": item.GroupName, "formatCode": "General"},
                {"value": item.Status, "formatCode": "General"},
                {"value": item.FundCnt.invest, "formatCode": "General"},
                {"value": item.FundCnt.reduce, "formatCode": "General"}
            ]
            data.push(val);
        }
        var buffer = xlsx.build({worksheets: [
            {"name": "조합원", data: data}
        ]});

        return buffer;
    }
}

exports.search = function (req, res) {
    var zone = req.params.zone;
    var name = req.query.name;
    var pid = req.query.pid;
    var regdate = req.query.regdate;
    var groupname = req.query.zonename;
    var status = req.query.status;
    var loanlength = req.query.loanlength;
    var exportfile = req.query.exportfile;

    var cond = {};

    var exportMember = new ExportMember();

    if (zone !== "all" && zone !== null && zone !== undefined) {
        cond["ZoneCode"] = zone;
        exportMember.name = zone;
    }
    if (name != null && name != undefined && name != '') {
        cond["Name"] = new RegExp(name, 'i');
    }
    if (pid != null && pid != undefined && pid != '') {
        cond["Pid"] = new RegExp(pid, 'i');
        exportMember.name = pid;
    }
    if (regdate != null && regdate != undefined && regdate != '') {
        var fromdate = new Date(regdate);
        var todate = new Date(regdate);
        todate.setHours(23, 59, 59, 999);
        cond["RegDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }
    //사업단이 group으로 바뀌어서 검색을 GroupName으로 변경함
    if (groupname != null && groupname != undefined && groupname != '') {
        cond["GroupName"] = new RegExp(groupname, 'i');
    }
    if (status !== "all" && status != undefined) {
        cond["Status"] = new RegExp(status, 'i');
    }
    //출자내역이 0이상인 경우 조회
    if (loanlength !== "all" && loanlength != undefined) {
        cond["Loan"] = {$gte: {$size: loanlength}};
    }

    console.log(cond);
    memberData.search(cond, function (err, result) {
        var mapFunc = function (data, callback) {
            var item = data.toObject();
            item.FundCnt = {reduce: 0, invest: 0};
            item.FundSum = 0;
            for (var i = 0; i < item.Fund.length; i++) {
                if (item.Fund[i].Method == '반환금') {
                    item.FundCnt.reduce++;
                    item.FundSum -= item.Fund[i].ReduceMoney;
                } else {
                    item.FundCnt.invest++;
                    item.FundSum += item.Fund[i].Money;
                }
            }
            callback(null, item)
        }
        async.map(result, mapFunc, function (err, result) {
            if (exportfile !== undefined) {
                var buffer = exportMember.generate(result);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + exportMember.getFileName());
                res.end(buffer, 'binary');
            } else {
                res.json(result)
            }
        })
    });
}

//pid는 고유하므로 update시 zone을 참조하지 않는다.
exports.findByPid = function (req, res) {
    var pid = req.params.pid;

    memberData.find({Pid: pid}, function (err, result) {
        res.json(result);
    });
}

exports.save = function (req, res) {
    var member = req.body;

    if (member.Pid != null || member.Pid != undefined) {
        var id = member.Pid;
        member.Pid = id.toLowerCase();
        console.log('add(manual):' + member.Pid + '/' + id);
        memberData.findByPid(member.Pid, function (err, result) {
            if (result) {
                var errmsg = member.Pid + "는 이미 사용중입니다.";
                console.log(errmsg)
                res.json({error: errmsg})
            } else {
                memberData.save(member, function (err, result) {
                    res.json(result);
                });
            }
        });
    } else {
        var id = undefined;

        async.whilst(
            function () {
                return id == undefined;
            },
            function (callback) {
                zoneData.incseq(member.ZoneCode, function (err, result) {
                    var tmpid = result.Code + '-' + prefixZeros(result.Seq, 6);
                    memberData.findByPid(tmpid, function (err, result) {
                        if (result) {
                            console.log('add(auto): id is exist ', tmpid)
                        } else {
                            //id가 없으면 새로 추가
                            id = tmpid;
                        }
                        callback();
                    });
                })
            },
            function (err) {
                console.log('add(auto):' + member.Pid + '/' + id);
                member.Pid = id.toLowerCase();
                memberData.save(member, function (err, result) {
                    res.json(result);
                });
            }
        );
    }
}

//update할때 member._id를 참조한다.
//member.passwordnew가 undefined가 아니면 비밀번호를 변경한다.
//전체 업데이트
exports.update = function (req, res) {
    var member = req.body;

    memberData.findByPid(member.Pid, function (err, user) {
        if (err) {
            return done(err);
        }
        user.updatePassword(member.passwordnew, function (err, hash) {
            if (err) return done(err);
            if (hash != null) {
                console.log("password changed:" + member.Pid + ":" + member.passwordnew);
                member.Password = hash;
            }
            console.log(member);
            memberData.update(member, function (err, result) {
                res.json(result)
            });
        });
    });
}

//Fund,Loan을 제외한 부분만 업데이트 수행
exports.partial_update = function (req, res) {
    var member = req.body;

    memberData.findByPid(member.Pid, function (err, user) {
        if (err) {
            return done(err);
        }
        user.updatePassword(member.passwordnew, function (err, hash) {
            if (err) return done(err);
            if (hash != null) {
                console.log("password changed:" + member.Pid + ":" + member.passwordnew);
                member.Password = hash;
            }
            memberData.partial_update(member, function (err, result) {
                res.json(result)
            });
        });
    });
}

exports.count = function (req, res) {
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var zone = req.params.zone;
    var cond = {};

    if (zone !== "all" && zone !== null) {
        cond["ZoneCode"] = zone;
    }

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        cond["RegDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }

    memberData.count(cond, function (err, result) {
        res.json(result)
    });
}

exports.summary = function (req, res) {
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var zone = req.params.zone;
    var group = req.params.group;
    var cond = {};

    if (zone !== "all" && zone !== null && zone !== undefined) {
        cond["ZoneCode"] = zone;
    }

    if (group !== "all" && group !== null && group !== undefined) {
        cond["GroupName"] = group;
    }

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        cond["RegDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }

    console.log(cond);
    memberData.summary(cond, function (err, result) {
        res.json(result)
    });
}


exports.dashboard = function (req, res) {
    var zone = req.params.zone;
    var cond = {};
    var cond_drop = {};
    cond_drop['Status'] = '탈퇴';

    if (zone !== "all" && zone !== null) {
        cond["ZoneCode"] = zone;
        cond_drop["ZoneCode"] = zone;
    }

    var retArr = [];

    async.parallel([
        function (callback) {
            //전체조합원
            memberData.count(cond, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result})
                }
            });
        },
        function (callback) {
            //신입조합원
            memberData.countNewbie(cond, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result});
                }
            });        },
        function (callback) {
            //탈퇴조합원
            memberData.count(cond_drop, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result});
                }
            });
        },
        function (callback) {
            //총출자금
            memberData.fundSumZone(cond, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result.sum});
                }
            });
        },
        function (callback) {
            //탈퇴금(탈퇴한 사용자들의 출자금합)
            memberData.fundSumZone(cond_drop, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result.sum});
                }
            });
        },
        function (callback) {
            //총대출금
            memberData.loanSumZone(cond, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result.sum});
                }
            });
        },
        function (callback) {
            //총대출상환금
            memberData.repaySumZone(cond, function (err, result) {
                if (err) {
                    callback(null, {val: null});
                } else {
                    callback(null, {val: result.sum});
                }
            });
        }
    ],
// optional callback
        function (err, results) {
            res.json(results);
        });
}


exports.loanSumZone = function (req, res) {
    var zone = req.params.zone;
    var cond = {};

    if (zone !== "all" && zone !== null) {
        cond["ZoneCode"] = zone;
    }

    memberData.loanSumZone(cond, function (err, result) {
        res.json(result)
    });
}

exports.repaySumZone = function (req, res) {
    var zone = req.params.zone;
    var cond = {};

    if (zone !== "all" && zone !== null) {
        cond["ZoneCode"] = zone;
    }

    memberData.repaySumZone(cond, function (err, result) {
        res.json(result)
    });
}


exports.fundSumZone = function (req, res) {
    var zone = req.params.zone;
    var cond = {};

    if (zone !== "all" && zone !== null) {
        cond["ZoneCode"] = zone;
    }

    memberData.fundSumZone(cond, function (err, result) {
        res.json(result)
    });
}

//    async.waterfall([
//        //지역명으로 쿼리하여 전체 리스트를 가져옴
//        function (callback) {
//            memberData.find({ZoneCode: zone}, function (err, result) {
//                var memberlist = result.slice(0);
//                callback(null, memberlist,fromdate,todate);
//            });
//        },
//        function (memberlist,fromdate,todate, callback) {
//            console.log('memberlist:' + memberlist.length);
//            var retArr = [];
//
//            for (var inx = 0; inx < memberlist.length; inx++) {
//                memberData.fundList(memberlist[inx].Pid, fromdate, todate, function (err, result) {
//                    if (result.length != 0) {
//                        var fundList = result[0].data;
//                        var prevMoney = 0;
//
//                        for (var i = 0; i < fundList.length; i++) {
//                            var fund = new Fund(fundList[i]);
//                            fund.Name = memberlist[inx].Name;
//                            fund.DepositNum = i + 1;
//                            fund.MoneySum = fundList[i].Money + prevMoney;
//                            prevMoney = fund.MoneySum;
//                            retArr.push(fund);
//                        }
//                    }
//                });
//            }
//            callback(null, retArr);
//        },
//        function (retArr, callback) {
//            console.log('return json');
//            console.log(retArr);
//            callback(null, retArr);
//        }
//    ],
//        function (err, result) {
//            // result now equals 'done'
//            res.json(result);
//        }
//    )

//루프를돌려 pid,fromdate,todate를 넘겨 개인 출자금 계산
//리스트를 리턴
//    for (var inx = 0; inx < memberlist.length; inx++) {
//        req.params.pid = memberlist[inx].pid;
//        console.log('req pid:'+req.params.pid);
//        fundList(req,res, function success(callback) {
//            //성공한 후 작업
//            for (var i = 0; i < callback.data.length; i++) {
//                callback.data[i].Name = memberlist[inx].Name;
//                retArr.push(callback.data[i]);
//            }
//        }, function error() {
//            console.log("Error: fund list")
//        });
//    }
//    console.log(retArr);
//    res.json(retArr);


//exports.create = function (req, res) {
//    async.waterfall([
//        function (callback) {
//            zoneData.list(function (err, result) {
//                callback(null, result);
//            });
//        },
//        function (zonelist, callback) {
//            var memberlist = []
//            for (var i = 0; i < zonelist.length; i++) {
//                var member = new Member(zonelist[i]);
//                memberlist.push(member);
//                zoneData.incseq(member.ZoneCode, function (err, func) {
//                    member.Pid = func.Code + func.Seq;
//                })
//                setTimeout(function(){console.log('end')}, 200);
//                if (i == zonelist.length-1) {
//                    callback(null, memberlist);
//                }
//            }
//
//        },
//        function (memberlist, callback) {
//            for (var i = 0; i < memberlist.length; i++) {
//                memberData.save(memberlist[i], function (err, result) {
//
//                });
//                setTimeout(function(){console.log('end')}, 200);
//            }
//            callback(null, []);
//        }
//    ], function (err, result) {
//        res.json(result);
//    });
//
//}






