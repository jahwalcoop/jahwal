var memberData = require('./model/member');
var async = require('async');

exports.dailymoney = function (req, res) {
    var cond = {};
//    var fromdate = req.query.fromdate;
//    var todate = req.query.todate;
    //하루전 데이터
    var date = Date.now();
    var todate = date;
    var fromdate = date - 60000 * 60 * 24 * 10;

    var zonecode = req.query.zonecode;

    if (zonecode !== undefined) {
        cond['ZoneCode'] = zonecode;
    }
    console.log(todate);
    console.log(fromdate);

    //var summarize = function (name, pid, fromdate, todate) {
    var name = 'a';
    var pid = 'b';
    var retData = [];

    async.parallel([
        function (callback) {
            //출자목록
            memberData.fundList(cond, fromdate, todate, function (err, result) {
                if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        for (var j = 0; i < result[i].data.length; j++) {
                            var data = result[i].data[j];
                            if (data.Method == '반환금') {
                                retData.push({Date: data.RepayDate, GroupName: data.GroupName, Name: name, Pid: pid, Method: data.Method, Out: data.payment, In: 0});
                            } else {
                                retData.push({Date: data.RepayDate, GroupName: data.GroupName, Name: name, Pid: pid, Method: data.Method, Out: 0, In: data.payment});
                            }
                        }
                    }
                }
                callback(null, null);

            });
        },
        function (callback) {
            //대출목록
            memberData.loanList(cond, fromdate, todate, function (err, result) {
                if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        for (var j = 0; i < result[i].data.length; j++) {
                            var data = result[i].data[j];
                            retData.push({Date: data.LoanDate, GroupName: data.LoanGroupName, Name: name, Pid: pid, Method: '대출금', Out: data.Principal, In: 0});
                        }
                    }
                }
                callback(null, null);
            });
        },
        function (callback) {
            //상환목록
//                memberData.repayList(cond, undefined, fromdate, todate, function (err, result) {
//                    if (result.length != 0) {
//                        for (var i = 0; i < result.length; i++) {
//                            for (var j = 0; i < result[i].data.length; j++) {
//                                var data = result[i].data[j];
//                                retData.push({Date: data.RepayDate, GroupName: data.RepayGroupName, Name: name, Pid: pid, Method: '상환금', Out: 0, In: data.Payment});
//                            }
//                        }
//                    }
            callback(null, null);
//                });
        }
    ],
        function (err, results) {
            console.log('retData:', retData.length);
            res.json(retData);
        }
    );
//    }
//
//    var dailydata = [];
//
//    memberData.find(cond, function (err, result) {
//        async.each(result,
//            function (member, callback) {
//                var result = summarize(member.Name, member.Pid, fromdate, todate);
//                if(result !== undefined) {
//                    for (var i=0; i<result.length;i++) {
//                        dailydata.push(result.pop())
//                    }
//                }
//
//                callback()
//            }, function (err) {
//                res.json(dailydata);
//            });
//    });

//출자목록
//    memberData.fundList({ZoneCode:zonecode}, fromdate, todate, function (err, result) {
//        console.log(result);
//        if (result.length != 0) {
//            res.json(result);
//        } else {
//            res.json({});
//        }
//    });
//대출목록
//    memberData.loanList({ZoneCode:zonecode},fromdate,todate, function (err, result) {
//        console.log(result);
//        if (result.length != 0) {
//            res.json(result);
//        } else {
//            res.json({});
//        }
//    });
//    //상환목록
//    memberData.repayList({ZoneCode:zonecode},undefined,fromdate,todate, function (err, result) {
//        console.log(result);
//        if (result.length != 0) {
//            res.json(result);
//        } else {
//            res.json({});
//        }
//    });
}

exports.export = function (req,res) {
    var xlsx = require('node-xlsx');

    var buffer = xlsx.build({worksheets: [
        {"name":"mySheetName", "data":[
            ["A1", "B1"],
            [
                {"value":"A2","formatCode":"General"},
                {"value":"B2","formatCode":"General"}
            ]
        ]}
    ]}); // returns a buffer

    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(buffer, 'binary');
}
