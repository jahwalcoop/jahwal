var memberData = require('./model/member');
var zoneData = require('./model/zone');
var async = require('async');

Date.prototype.valid = function () {
    return isFinite(this);
}

function Repay(val) {
    this._id = val._id;
    this.RepayNo = 0;
    this.RepayDate = val.RepayDate;
    this.Payment = val.Payment;
    this.Interest = val.Interest;
    this.RepayGroupName = val.RepayGroupName;
    this.RepaySum = 0;
    this.RepayBalance = 0;
}

exports.save = function (req, res) {
    var pid = req.params.pid;
    var loanid = req.params.loanid;
    var repay = req.body;

    //클라이언트에서 _id를 붙여오면 삭제해줘야 한다(_id중복방지)
    delete repay._id;
    memberData.findByPid(pid, function (err, result) {
        if (result != null && result != undefined) {
            result.Loan.id(loanid).Repay.push(repay);

            result.save(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result);
                }
            });
        } else {
            res.json({});
        }
    });
}

//함수를 사용하기전에 날짜순으로 정렬이 되어있어야 한다.
var repayCalc = function(principal,repayList) {
    var prevMoney = 0;
    var retArr = [];

    repayList.sort(function (r1, r2) {
        return r1.RepayDate - r2.RepayDate
    });

    for (var inx = 0; inx < repayList.length; inx++) {
        var repay = new Repay(repayList[inx]);
        repay.RepayNo = inx+1;
        repay.RepaySum = repay.Payment + prevMoney;
        prevMoney = repay.RepaySum;
        repay.RepayBalance = principal - repay.RepaySum;
        retArr.push(repay);
    }
    return retArr;
}

exports.repayCalc = repayCalc;

exports.list = function (req, res) {
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var pid = req.params.pid;
    var loanid = req.params.loanid;
    var cond = {};

    if (pid !== "all" && pid !== null) {
        cond["Pid"] = pid;
    }

    memberData.repayList(cond,loanid,fromdate,todate, function (err, result) {
        if (result.length != 0) {
            var retArr = repayCalc(result[0].principal,result[0].data)

            res.json({loanid:result[0]._id,count:result[0].count, repaySum: result[0].repaySum,interestSum:result[0].interestSum, data: retArr});
        } else {
            res.json({});
        }
    });
}

exports.update = function (req, res) {
    var pid = req.params.pid;
    var loanid = req.params.loanid;
    var repayid = req.params.repayid;
    var repay = req.body;

    console.log(repay);
    memberData.findByPid(pid, function (err, result) {
        result.Loan.id(loanid).Repay.id(repayid).RepayDate = repay.RepayDate;
        result.Loan.id(loanid).Repay.id(repayid).Payment = repay.Payment;
        result.Loan.id(loanid).Repay.id(repayid).Interest = repay.Interest;
        result.Loan.id(loanid).Repay.id(repayid).RepayGroupName = repay.RepayGroupName;

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
    var loanid = req.params.loanid;
    var repayid = req.params.repayid;

    memberData.findByPid(pid, function (err, result) {
        result.Loan.id(loanid).Repay.id(repayid).remove();

        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}