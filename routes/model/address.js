var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.save = function (address, callback) {
    var Address = mongoose.model('Address');
    var saveAddress = new Address(address);

    saveAddress
        .save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback("", result);
            }
        });
}

exports.list = function (cond,callback) {
    var Address = mongoose.model('Address');
    var query = Address.find(cond);
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