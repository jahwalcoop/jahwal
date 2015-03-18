var memberData = require('./model/member');
var zoneData = require('./model/zone');
var async = require('async');
var xlsx = require('node-xlsx');
var moment = require('moment');

Date.prototype.valid = function () {
    return isFinite(this);
}

function Fund(val) {
    this._id = val._id;
    this.Name = '';
    this.DepositNum = 0;
    this.DepositDate = val.DepositDate;
    this.Method = val.Method;
    this.Money = val.Money;
    this.ReduceMoney = val.ReduceMoney;
    this.MoneySum = 0;
    this.GroupName = val.GroupName;
}


exports.save = function (req, res) {
    var pid = req.params.pid;
    var fund = req.body;

    console.log(fund);
    console.log('save fund:' + pid);
    //클라이언트에서 _id를 붙여오면 삭제해줘야 한다(_id중복방지)
    delete fund._id;
    memberData.findByPid(pid, function (err, result) {
        result.Fund.push(fund);

        //TODO : save와 update의 차이는?
        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}

exports.update = function (req, res) {
    var pid = req.params.pid;
    var fundid = req.params.fundid;
    var fund = req.body;

    console.log(fund);
    memberData.findByPid(pid, function (err, result) {
        //TODO : 더 간단한 방법은?
        delete fund._id;
        result.Fund.id(fundid).Name = fund.Name;
        result.Fund.id(fundid).DepositNum = fund.DepositNum;
        result.Fund.id(fundid).DepositDate = fund.DepositDate;
        result.Fund.id(fundid).Method = fund.Method;
        result.Fund.id(fundid).Money = fund.Money;
        result.Fund.id(fundid).ReduceMoney = fund.ReduceMoney;
        result.Fund.id(fundid).MoneySum = fund.MoneySum;
        result.Fund.id(fundid).GroupName = fund.GroupName;
        console.log(result.Fund.id(fundid));

        //TODO : save와 update의 차이는?
        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}

exports.delete = function (req, res) {
    var pid = req.params.pid;
    var fundid = req.params.fundid;

    console.log(fundid);
    memberData.findByPid(pid, function (err, result) {
        result.Fund.id(fundid).remove();

        //TODO : save와 update의 차이는?
        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}

function ExportFund() {
    this.name = '';
    this.getFileName = function () {
        return "fund(" + this.name + ").xlsx";
    }
    this.generate = function (result) {
        var data = [];
        data.push(["출자횟수", "출자 입금일", "출자방법", "출자액", "감자액", "출자누계", "사업단"]);
        for (var i = 0; i < result.length; i++) {
            var item = result[i];
            var DepositDate = moment(item.DepositDate).format('YYYY/MM/DD');
            var val = [
                {"value": item.DepositNum, "formatCode": "General"},
                {"value": DepositDate, "formatCode": "General"},
                {"value": item.Method, "formatCode": "General"},
                {"value": item.Money, "formatCode": "General"},
                {"value": item.ReduceMoney, "formatCode": "General"},
                {"value": item.MoneySum, "formatCode": "General"},
                {"value": item.GroupName, "formatCode": "General"}
            ]
            data.push(val)
        }
        var buffer = xlsx.build({worksheets: [
            {"name": "출자금(" + this.name + ")", data: data}
        ]});

        return buffer;
    }
}

exports.fundList = function (req, res) {
    var pid = req.params.pid;
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var exportfile = req.query.exportfile;

    console.log('fundlist');

    var exportFund = new ExportFund();
    exportFund.name = pid;

    memberData.fundList({Pid: pid}, fromdate, todate, function (err, result) {
        if (result.length != 0) {
            var fundList = result[0].data;
            var retArr = [];
            var prevMoney = 0;

            for (var i = 0; i < fundList.length; i++) {
                var fund = new Fund(fundList[i]);
                console.log(fundList[i])
                fund.DepositNum = i + 1;
                if (fund.Method == '반환금') {
                    fund.MoneySum = prevMoney - fundList[i].ReduceMoney;
                    fund.Money = 0;
                } else {
                    fund.MoneySum = prevMoney + fundList[i].Money;
                    fund.ReduceMoney = 0;
                }
                prevMoney = fund.MoneySum;
                retArr.push(fund);
            }
            result[0].calcData = retArr;

            if (exportfile !== undefined) {
                var buffer = exportFund.generate(retArr);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + exportFund.getFileName());
                res.end(buffer, 'binary');
            } else {
                res.json({sum: result[0].sum - result[0].reduce, data: retArr});
            }
        } else {
            res.json({});
        }
    });
}

exports.fundAll = function (req, res) {
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var zone = req.params.zone;
    var groupname = req.query.groupname;
    var cond = {};

    if (zone !== "all" && zone !== undefined) {
        cond["ZoneCode"] = zone;
    }

    if (groupname !== "all" && groupname !== undefined) {
        cond["GroupName"] = groupname;
    }

    // #77 - 활동중인 조합원만 계산. 탈퇴조합원은 뺌.
    cond["Status"] = '활동중';

    var retArr;
    memberData.find(cond, function (err, result) {
        var members = result;
        var retArr = [];

        var fundInfo = function (member, doneCallback) {
            memberData.fundList({Pid: member.Pid}, fromdate, todate, function (err, result) {
                if (result.length != 0) {
                    var fundList = result[0].data;
                    var prevMoney = 0;

                    for (var i = 0; i < fundList.length; i++) {
                        var fund = new Fund(fundList[i]);
                        fund.Name = member.Name;
                        fund.DepositNum = i + 1;
                        if (fund.Method == '반환금') {
                            fund.MoneySum = prevMoney - fundList[i].ReduceMoney;
                            fund.Money = 0;
                        } else {
                            fund.MoneySum = prevMoney + fundList[i].Money;
                            fund.ReduceMoney = 0;
                        }
                        prevMoney = fund.MoneySum;
                        retArr.push(fund);
                    }
                }
                return doneCallback(null, member.Pid);
            });
        }
        async.map(members, fundInfo, function (err, results) {
            res.json(retArr);
        })
    });
}
exports.fundSum = function (req, res) {
    var pid = req.params.pid;

    var data = {MoneySumAll: 0, sum: 0, reduce: 0, count: 0}

    memberData.fundSumList({Pid: pid}, undefined, undefined, function (err, result) {
        if (result.length != 0) {
            data.sum = result[0].sum;
            data.reduce = result[0].reduce;
            data.MoneySumAll = result[0].sum - result[0].reduce;
            data.count = result[0].count;
        }
        console.log(result);
        return res.json(data);
    });
}

exports.fundActive = function (req, res) {
    var zone = req.params.zone;
    var group = req.params.group;
    var status = req.query.status;
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var cond = {}

    if (zone !== "all" && zone !== undefined) {
        cond["ZoneCode"] = zone;
    }

    if (group !== "all" && group !== undefined) {
        cond["GroupName"] = group;
    }

    if (status !== "all" && status !== undefined) {
        cond["Status"] = status;
    }

    memberData.find(cond, function (err, result) {
        var members = result;
        var retInfo = {count: 0, payment: 0, default: 0, list: []};

        var fundInfo = function (member, doneCallback) {
            memberData.fundSumList({Pid: member.Pid}, fromdate, todate, function (err, result) {
                var item = member.toObject();
                // 출자금납부현황
                retInfo.count++;
                if (result.length != 0) {
                    item.FundStatus = '정상';
                    retInfo.payment++;
                } else {
                    item.FundStatus = '미납';
                    retInfo.default++;
                }
                // 출자금 증자,감자현황
                item.FundCnt = {reduce: 0, invest: 0};
                for (var i = 0; i < item.Fund.length; i++) {
                    if (item.Fund[i].Method == '반환금') {
                        item.FundCnt.reduce++;
                    } else {
                        item.FundCnt.invest++;
                    }
                }
                retInfo.list.push(item);
                return doneCallback(null, item);
            });
        }
        async.map(members, fundInfo, function (err, results) {
            res.json(retInfo);
        })
    });
}