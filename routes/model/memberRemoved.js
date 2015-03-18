var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.save = function (member, callback) {
    var MemberRemoved = mongoose.model('MemberRemoved');
    var saveMember = new MemberRemoved(member);

    saveMember
        .save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}