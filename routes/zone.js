var zoneData = require('./model/zone');
var fs = require('fs');

exports.getseq = function (req, res) {
    var code = req.params.code;
    console.log('getseq:' + code);
    zoneData.incseq(code, function (err, result) {
        res.json(result);
    });
}

exports.list = function (req, res) {
    zoneData.list(function (err, result) {
        res.json(result);
    });
}

exports.findByCode = function (req, res) {
    var code = req.params.code;
    zoneData.findByCode(code, function (err, result) {
        res.json(result);
    });
}

exports.update = function (req, res) {
    var code = req.params.code;
    var zone = req.body;

    console.log(zone);
    zoneData.partial_update(zone, function (err, result) {
        res.json(result);
    });
}

// 부분업데이트. zone.Name이 변경되면 zone에 속한 member.ZoneName을 변경한다.
exports.partial_update = function (req, res) {
    var code = req.params.code;
    var zone = req.body;

    zoneData.partial_update(zone, function (err, result) {
        res.json(result);
    });
}

exports.grouplist = function (req, res) {
    var code = req.params.code;

    zoneData.findByCode(code, function (err, result) {
        if(result !=null) {
            res.json(result.Group);
        } else {
            res.json([])
        }

    });
}

exports.groupsave = function (req, res) {
    var code = req.params.code;
    var group = req.body;

    console.log(group);
    delete group._id;
    zoneData.findByCode(code, function (err, result) {
        result.Group.push(group);

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

exports.groupupdate = function (req, res) {
    var groupid = req.params.groupid;
    var code = req.params.code;
    var group = req.body;

    zoneData.findByCode(code, function (err, result) {
        delete group._id;
        result.Group.id(groupid).GroupName = group.GroupName;
        result.Group.id(groupid).ContactName = group.ContactName;
        result.Group.id(groupid).GroupPhone = group.GroupPhone;
        console.log(result.Group.id(groupid));

        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}

exports.groupdelete = function (req, res) {
    var groupid = req.params.groupid;
    var code = req.params.code;
    var group = req.body;

    console.log(group);
    zoneData.findByCode(code, function (err, result) {
        result.Group.id(groupid).remove();

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

//buy
exports.buylist = function (req, res) {
    var code = req.params.code;

    zoneData.findByCode(code, function (err, result) {
        if(result != null) {
            res.json(result.Buy);
        } else {
            res.json([])
        }
    });
}

exports.buysave = function (req, res) {
    var code = req.params.code;
    var buy = req.body;

    console.log(buy);
    delete buy._id;
    zoneData.findByCode(code, function (err, result) {
        result.Buy.push(buy);

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

exports.buyupdate = function (req, res) {
    var buyid = req.params.buyid;
    var code = req.params.code;
    var buy = req.body;

    zoneData.findByCode(code, function (err, result) {
        delete buy._id;
        result.Buy.id(buyid).StDate = buy.StDate;
        result.Buy.id(buyid).Subject = buy.Subject;
        result.Buy.id(buyid).Status = buy.Status;
        result.Buy.id(buyid).EdDate = buy.EdDate;
        result.Buy.id(buyid).GroupName = buy.GroupName;
        result.Buy.id(buyid).Sales = buy.Sales;
        result.Buy.id(buyid).Bill = buy.Bill;
        console.log(result.Buy.id(buyid));

        result.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        });
    });
}

exports.buydelete = function (req, res) {
    var buyid = req.params.buyid;
    var code = req.params.code;
    var buy = req.body;

    console.log(buy);
    zoneData.findByCode(code, function (err, result) {
        result.Buy.id(buyid).remove();

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

exports.moneycut = function (req, res) {
    var code = req.params.code;

    zoneData.findByCode(code, function (err, result) {
        if(result != null) {
            res.json({MoneyCut:result.MoneyCut});
        } else {
            res.json({})
        }
    });
}