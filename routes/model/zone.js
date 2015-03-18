var mongoose = require('mongoose');
var async = require('async');

exports.list = function (callback) {
    var Zone = mongoose.model('Zone');
    var query = Zone.find();
    console.log("Zone List");
    query
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.findByCode = function (code, callback) {
    var Zone = mongoose.model('Zone');
    var query = Zone.findOne({Code: code});
    console.log("Zone List:" + code);
    query
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.update = function (zone, callback) {
    var Zone = mongoose.model('Zone');
    var id = zone._id;
    delete zone._id;

    Zone.update({_id: id}, zone, {upsert: true}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            callback("", result);
        }
    });
}

// 부분업데이트. zone.Name이 변경되면 zone에 속한 member.ZoneName을 변경한다.
exports.partial_update = function (newzone, callback) {
    var Zone = mongoose.model('Zone');
    var Member = mongoose.model('Member');
    var id = newzone._id;
    delete newzone._id;

    delete newzone.Group;
    delete newzone.Buy;

    async.waterfall([
        function (callback) {
            // zone가져오기
            Zone.findOne({Code: newzone.Code}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    callback(null, result);
                }
            });
        },
        function (prevzone, callback) {
            // Name이 변경되었는지 확인
            if (prevzone.Name != newzone.Name) {
                // 변경되었으면  zone에 속한 사용자의 ZoneName을 업데이트
                Member.update({ZoneCode: newzone.Code}, {ZoneName: newzone.Name}, {multi: true}, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('updatename')
                        callback(null);
                    }
                });
            } else {
                console.log('no updatename')
                callback(null);
            }
        },
        function (callback) {
            // zone을 업데이트
            Zone.update({_id: id}, newzone, {upsert: true}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    callback(null, result);
                }
            });
        }
    ], function (err, result) {
        callback("", result);
    });
}

exports.save = function (zone, callback) {
    var Zone = mongoose.model('Zone');
    var saveZone = new Zone(zone);
    console.log(saveZone);
    saveZone
        .save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

//TODO: 시리얼하게 처리해야 한다. 동시처리시 동일한 ID가 발급될 수 있다.
exports.incseq = function (code, callback) {
    var Zone = mongoose.model('Zone');
    console.log('incseq:' + code);
    Zone
        .findOneAndUpdate({Code: code}, {$inc: {Seq: 1}}, {upsert: true}, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

//id가 있을경우 시퀀스를 1감소시킨다
exports.decseq = function (code, callback) {
    var Zone = mongoose.model('Zone');
    console.log('incseq:' + code);
    Zone
        .findOneAndUpdate({Code: code}, {$inc: {Seq: -1}}, {upsert: true}, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

