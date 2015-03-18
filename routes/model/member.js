var mongoose = require('mongoose');
var Schema = mongoose.Schema;

Date.prototype.valid = function () {
    return isFinite(this);
}

exports.delete = function (pid, callback) {
    var Member = mongoose.model('Member');
    var query = Member.remove({Pid: pid});
    console.log("member List");

    query
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.list = function (cond, callback) {
    var Member = mongoose.model('Member');
    var query = Member.find(cond);
    console.log("member List");

    query
        .where('MemberClass').ne('관리자')
        .sort({'Pid': 1})
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.find = function (cond, callback) {
    var Member = mongoose.model('Member');
    var query = Member.find(cond);
    console.log("member find:" + cond);

    query
        .where('MemberClass').ne('관리자')
        .sort({'Pid': 1})
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.search = function (cond, callback) {
    var Member = mongoose.model('Member');
    var query = Member.find(cond);
    console.log("member find:" + cond);

    query
        .where('MemberClass').ne('관리자')
        .sort({'Pid': 1})
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.countNewbie = function (cond, callback) {
    var Member = mongoose.model('Member');
    var query = Member.find(cond);
    var date = new Date();
    date.setMonth(0);
    date.setDate(1);
    date.setHours(00, 00, 00, 000);

    query
        .where('MemberClass').ne('관리자')
        .where('RegDate').gt(date)
        .count(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                callback("", count);
            }
        });
}

exports.findByPid = function (pid, callback) {
    var Member = mongoose.model('Member');
    var query = Member.findOne({'Pid': pid});

    query
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.save = function (member, callback) {
    var Member = mongoose.model('Member');
    var saveMember = new Member(member);

    saveMember
        .save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

//전체 업데이트
exports.update = function (member, callback) {
    var Member = mongoose.model('Member');
    var id = member._id;
    delete member._id;
    Member.update({_id: id}, member, {upsert: true}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            callback("", result);
        }
    });
}

//부분 업데이트
exports.partial_update = function (member, callback) {
    var Member = mongoose.model('Member');
    var id = member._id;
    delete member._id;
    //fund,loan을 제외하고 업데이트
    delete member.Fund;
    delete member.Loan;

    Member.update({_id: id}, member, {upsert: true}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            callback("", result);
        }
    });
}

exports.count = function (cond, callback) {
    var Member = mongoose.model('Member');
    var query = Member.find(cond);

    query
        .where('MemberClass').ne('관리자')
        .count(function (err, result) {
        if (err) {
            console.log(err);
        } else {
            callback("", result);
        }
    });
}

exports.summary = function (cond, callback) {
    var Member = mongoose.model('Member');
//    Member.aggregate(
//        { $group: { _id: null, maxAge: { $max: '$age' }}},
//        { $project: { _id: 0, maxAge: 1 }},
//        function (err, res) {
//            if (err) {
//                console.log(err);
//            } else {
//                callback("", result);
//            }
//        });
    Member.aggregate([
        {$match: cond},
        { $group: { _id: "$Status", count: { $sum: 1 } } }
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}


exports.findFund = function (pid, fromdate, todate, callback) {
    var Member = mongoose.model('Member');
//    var query = Member.find({Pid:pid},{Fund:{$elemMatch:{DepositDate:{$gte: new Date(fromdate), $lt: new Date(todate)}}}});
//    var query = Member.find({Pid:pid});
    var query = Member.findOne({'Pid': pid});

    console.log('log:' + fromdate + ':' + todate);
    query
//        .where('Fund')
//        .elemMatch(function(elem){
//            elem.where('Money').gte(2000)
//            elem.where('Money').lt(10001)
//        })
        .count()
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.fundList = function (cond, fromdate, todate, callback) {
    var Member = mongoose.model('Member');
    var condsub = {};

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        condsub["Fund.DepositDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }

    Member.aggregate([
        {$match: cond},
        {$unwind: "$Fund"},
//        ,{$project:{"Fund.Money":1,"Fund.DepositDate":1,"Fund._id":1}}
        {$match: condsub},
        {$sort: {"Fund.DepositDate": 1}},
        {$group: {
            _id: "$Pid",
            count: {$sum: 1},
            sum: {$sum: '$Fund.Money'},
            reduce: {$sum: '$Fund.ReduceMoney'},
            data: {
                $push: {
                    _id: '$Fund._id',
                    DepositDate: '$Fund.DepositDate',
                    Money: '$Fund.Money',
                    ReduceMoney: '$Fund.ReduceMoney',
                    Method: '$Fund.Method',
                    GroupName: '$Fund.GroupName'
                }
            }
        }}

//        ,{$project:{"_id.Money":1,"_id.DepositDate":1,"_id._id":1,"_id":0}}
//        ,{$unwind:"$data"}
//        ,{$group:{_id:null}}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.fundSumList = function (cond, fromdate, todate, callback) {
    var Member = mongoose.model('Member');
    var condsub = {};

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        condsub["Fund.DepositDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }

    Member.aggregate([
        {$match: cond},
        {$unwind: "$Fund"},
        {$match: condsub},
        {$sort: {"Fund.DepositDate": 1}},
        {$group: {
            _id: "$Pid",
            count: {$sum: 1},
            sum: {$sum: '$Fund.Money'},
            reduce: {$sum: '$Fund.ReduceMoney'}
        }}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.loanList = function (cond, fromdate, todate, callback) {
    var Member = mongoose.model('Member');
    var condsub = {};

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        condsub["Loan.LoanDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }
    //console.log(condsub);
    Member.aggregate([
        {$match: cond},
        {$unwind: "$Loan"},
//        {$project:{"Fund.Money":1,"Fund.DepositDate":1,"Fund._id":1}},
        {$match: condsub},
        {$sort: {"Loan.LoanDate": 1}},
        {$group: {
            _id: "$Pid",
            count: {$sum: 1},
            loanSum: {$sum: '$Loan.Principal'},
            data: {
                $push: {
                    _id: '$Loan._id',
                    LoanType: '$Loan.LoanType',
                    Name: '$Name',
                    LoanDate: '$Loan.LoanDate',
                    LoanExpDate: '$Loan.LoanExpDate',
                    LoanPeriod: '$Loan.LoanPeriod',
                    LoanRate: '$Loan.LoanRate',
                    LoanUse: '$Loan.LoanUse',
                    Principal: '$Loan.Principal',
                    Repay: "$Loan.Repay",
                    LoanGroupName: "$Loan.LoanGroupName"
                }
            }
        }}
//        ,{$project:{"_id.Money":1,"_id.DepositDate":1,"_id._id":1,"_id":0}}
//        ,{$unwind:"$data"}
//        ,{$group:{_id:null}}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.repayList = function (cond, loanid, fromdate, todate, callback) {
    var Member = mongoose.model('Member');
    var condsub = {}

    //console.log(loanid);

    if(loanid !== undefined) {
        condsub["Loan._id"] = mongoose.Types.ObjectId(loanid);
    }

    var fromdate = new Date(fromdate);
    var todate = new Date(todate);
    if (fromdate.valid() && todate.valid()) {
        condsub["Loan.Repay.RepayDate"] = {$gte: new Date(fromdate), $lt: new Date(todate)};
    }

    //console.log(cond);
    //console.log(condsub);
    Member.aggregate([
        {$match: cond},
        {$unwind: "$Loan"},
        {$unwind: "$Loan.Repay"},
//        ,{$project:{"Loan._id":1,"Loan.Principal":1,"Loan.Repay":1}}
        {$sort: {"Loan.Repay.RepayDate": 1}},
        {$match: condsub},
        {$group: {
            _id: "$Loan._id",
            principal: {$first: "$Loan.Principal"},
            count: {$sum: 1},
            repaySum: {$sum: '$Loan.Repay.Payment'},
            interestSum: {$sum: '$Loan.Repay.Interest'},
            data: {
                $push: {
                    _id: "$Loan.Repay._id",
                    RepayDate: "$Loan.Repay.RepayDate",
                    Payment: "$Loan.Repay.Payment",
                    Interest: "$Loan.Repay.Interest",
                    RepayGroupName: "$Loan.Repay.RepayGroupName"
                }
            }
        }}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

// dashboard : 총출자금
exports.fundSumZone = function (cond, callback) {
    var Member = mongoose.model('Member');
    console.log(cond);

    Member.aggregate([
        {$match: cond},
        {$unwind: "$Fund"},
        {$project: {"Fund.Money": 1,"Fund.ReduceMoney": 1, "Fund._id": 1}},
        {$group: {
            _id: 0,
            count: {$sum: 1},
            total: {$sum: '$Fund.Money'},
            sum: {$sum: '$Fund.Money'},
            reduce: {$sum: '$Fund.ReduceMoney'}
        }},
        {$project: {"_id": 0, "count": 1, "sum": 1, "reduce": 1}}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
                callback(err, "");
            } else {
                // aggregation결과가 없을때의 처리
                if (result.length == 0) {
                    callback("", {count: 0, sum: 0, reduce: 0})
                } else {
                    //활동중인 조합원의 출자내역에서 감자내역을 뺌
                    result[0].sum -= result[0].reduce;
                    callback("", result[0]);
                }
            }
        });
}

// dashboard : 총대출금
exports.loanSumZone = function (cond, callback) {
    var Member = mongoose.model('Member');
    Member.aggregate([
        {$match: cond},
        {$unwind: "$Loan"},
        {$project: {"Loan.Principal": 1, "Loan._id": 1}},
        {$group: {
            _id: 0,
            count: {$sum: 1},
            sum: {$sum: '$Loan.Principal'}
        }},
        {$project: {"_id": 0, "count": 1, "sum": 1}}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                // aggregation결과가 없을때의 처리
                if (result.length == 0) {
                    callback("", {count: 0, sum: 0})
                } else {
                    callback("", result[0]);
                }
            }
        });
}

// dashboard : 총대출상환금
exports.repaySumZone = function (cond, callback) {
    var Member = mongoose.model('Member');
    Member.aggregate([
        {$match: cond},
        {$unwind: "$Loan"},
        {$unwind: "$Loan.Repay"},
        {$project: {"Loan.Repay.Payment": 1, "Loan.Repay._id": 1}},
        {$group: {
            _id: 0,
            count: {$sum: 1},
            sum: {$sum: '$Loan.Repay.Payment'}
        }},
        {$project: {"_id": 0, "count": 1, "sum": 1}}
    ],
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                // aggregation결과가 없을때의 처리
                if (result.length == 0) {
                    callback("", {count: 0, sum: 0})
                } else {
                    callback("", result[0]);
                }
            }
        });
}