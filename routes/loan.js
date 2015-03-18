var memberData = require('./model/member');
var zoneData = require('./model/zone');
var repay = require('./repay');
var async = require('async');
var xlsx = require('node-xlsx');
var moment = require('moment');

function Loan(val) {
    this._id = val._id;
    this.LoanNo = val.LoanNo;
    this.Name = val.Name;
    this.LoanType = val.LoanType;
    this.LoanDate = val.LoanDate;
    this.LoanExpDate = val.LoanExpDate;
    this.LoanPeriod = val.LoanPeriod;
    this.LoanPeriodNum = val.LoanPeriodNum;
    this.LoanRate = val.LoanRate;
    this.LoanUse = val.LoanUse;
    this.Principal = val.Principal;
    this.LoanGroupName = val.LoanGroupName;
    this.Repay = val.Repay.slice(0);
    this.RepaySum = 0;
    this.Balance = 0;
}

//조합원 전체데이터를 엑셀로 받을수있도록 한다.
function ExportLoan () {
    this.name='';
    this.getFileName = function () {
        return "loan(" + this.name + ").xlsx";
    }
    this.generate = function (result) {
        var data = [];

        for (var inx = 0; inx < result.length; inx++) {
            var loanList = result[inx].data;
            //대출데이터
            data.push(["----------"]);
            data.push(["조합원번호", result[inx].Pid]);
            data.push(["대출계", result[inx].loanSum]);
            data.push(["상환계", result[inx].repaySum]);
            data.push([""]);
            for (var i = 0; i < loanList.length; i++) {
                var item = loanList[i];
                //대출헤더
                data.push(["번호", "대출유형", "대출일", "만기일", "기간(월)", "이자율(%)", "대출금액", "용도", "사업단", "상환액", "잔액"]);
                var LoanDate = moment(item.LoanDate).format('YYYY/MM/DD');
                var LoanExpDate = moment(item.LoanExpDate).format('YYYY/MM/DD');
                var val = [
                    {"value": item.LoanNo, "formatCode": "General"},
                    {"value": item.LoanType, "formatCode": "General"},
                    {"value": LoanDate, "formatCode": "General"},
                    {"value": LoanExpDate, "formatCode": "General"},
                    {"value": item.LoanPeriod, "formatCode": "General"},
                    {"value": item.LoanRate, "formatCode": "General"},
                    {"value": item.Principal, "formatCode": "General"},
                    {"value": item.LoanUse, "formatCode": "General"},
                    {"value": item.LoanGroupName, "formatCode": "General"},
                    {"value": item.RepaySum, "formatCode": "General"},
                    {"value": item.Balance, "formatCode": "General"}
                ]
                data.push(val)
                data.push(["", "", "", "", "", "", "", "", "", "", ""]);

                //상환데이터 계산
                var repayList = repay.repayCalc(item.Principal, item.Repay);
                //상환데이터 만들기
                data.push(["날짜", "사업단", "상환납입회차", "상환납입금", "이자액", "상환누계", "상환잔액"]);
                for (var j = 0; j < repayList.length; j++) {
                    var item = repayList[j];
                    var RepayDate = moment(item.RepayDate).format('YYYY/MM/DD');
                    var val = [
                        {"value": RepayDate, "formatCode": "General"},
                        {"value": item.RepayGroupName, "formatCode": "General"},
                        {"value": item.RepayNo, "formatCode": "General"},
                        {"value": item.Payment, "formatCode": "General"},
                        {"value": item.Interest, "formatCode": "General"},
                        {"value": item.RepaySum, "formatCode": "General"},
                        {"value": item.RepayBalance, "formatCode": "General"}
                    ]
                    data.push(val)
                }
                //빈데이터
                data.push([""]);
                data.push([""]);
            }
        }
        //버퍼에 담는다.
        var buffer = xlsx.build({worksheets: [
            {"name": "대출금(" + this.name + ")", data: data}
        ]});

        return buffer;
    }
}

exports.list = function (req, res) {
    var fromdate = req.query.fromdate;
    var todate = req.query.todate;
    var pid = req.params.pid;
    var status = req.query.status;//progress,complete
    var zone = req.query.zone;
    var group = req.query.group;
    var exportfile = req.query.exportfile;

    var cond = {};

    var exportLoan = new ExportLoan();

    if (pid !== "all" && pid !== null && pid != undefined) {
        cond["Pid"] = pid;
        exportLoan.name = pid;
    } else {
        //pid가 all이거나 pid가 없는경우 zone과 group으로 조회할 수 있다.
        if (zone !== "all" && zone !== null && zone != undefined) {
            cond["ZoneCode"] = zone;
            exportLoan.name = zone;
        }

        if (group !== "all" && group !== null && group != undefined) {
            cond["GroupName"] = group;
        }
    }

    console.log(cond);

    //대출일로 sort하려면 aggregation을 거쳐야 하기 때문에 따로 만들어준다.
    memberData.loanList(cond, fromdate, todate, function (err, result) {
        var retData = [];

        if (result.length != 0) {
            for (var inx = 0; inx < result.length; inx++) {

                var loanList = result[inx].data;
                var retArr = [];
                var prevMoney = 0;
                var repaySum = 0;

                for (var subInx = 0; subInx < loanList.length; subInx++) {
                    var loan = new Loan(loanList[subInx]);
                    loan.LoanNo = subInx + 1;
                    for (var i = 0; i < loan.Repay.length; i++) {
                        loan.RepaySum += loan.Repay[i].Payment;
                    }
                    loan.Balance = loan.Principal - loan.RepaySum;
                    repaySum += loan.RepaySum;

                    if (status == 'progress' && loan.RepaySum == loan.Principal) {
                        continue;
                    }
                    if (status == 'complete' && loan.RepaySum != loan.Principal) {
                        continue;
                    }

                    retArr.push(loan);
                }

                retData.push({Pid: result[inx]._id, loanSum: result[inx].loanSum, repaySum: repaySum, data: retArr});
            }

            if (exportfile !== undefined) {
                var buffer = exportLoan.generate(retData);

                //파일을 리턴한다.
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + exportLoan.getFileName());
                res.end(buffer, 'binary');
            } else {
                res.json(retData);
            }
        } else {
            //데이터가 없을경우
            res.json([
                {loanSum: 0, repaySum: 0, data: []}
            ]);
        }
    });
}

exports.save = function (req, res) {
    var pid = req.params.pid;
    var loan = req.body;

    console.log(loan);
    //클라이언트에서 _id를 붙여오면 삭제해줘야 한다(_id중복방지)
    delete loan._id;
    memberData.findByPid(pid, function (err, result) {
        result.Loan.push(loan);

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
    var loanid = req.params.loanid;
    var loan = req.body;

    console.log(loan);
    memberData.findByPid(pid, function (err, result) {
        //TODO : 더 간단한 방법은?
        delete loan._id;
        result.Loan.id(loanid).LoanNo = loan.LoanNo;
        result.Loan.id(loanid).LoanType = loan.LoanType;
        result.Loan.id(loanid).LoanDate = loan.LoanDate;
        result.Loan.id(loanid).LoanExpDate = loan.LoanExpDate;
        result.Loan.id(loanid).LoanPeriod = loan.LoanPeriod;
        result.Loan.id(loanid).LoanPeriodNum = loan.LoanPeriodNum;
        result.Loan.id(loanid).LoanRate = loan.LoanRate;
        result.Loan.id(loanid).LoanUse = loan.LoanUse;
        result.Loan.id(loanid).Principal = loan.Principal;
        result.Loan.id(loanid).LoanGroupName = loan.LoanGroupName;

        console.log(result.Loan.id(loanid));

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
    var loanid = req.params.loanid;

    console.log(loanid);
    memberData.findByPid(pid, function (err, result) {
        result.Loan.id(loanid).remove();

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