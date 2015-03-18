var addressData = require('./model/address');
var async = require('async');

exports.save = function (req, res) {
    var address = req.body;

    addressData.save(address, function (err, result) {
        res.json(result);
    });
}

exports.list = function (req, res) {
    var search = req.query.search;
    var cond = {};

    if (search !== undefined && search !== 'undefined') {
        cond = {Dong:search};
    }
    console.log(cond);

    addressData.list(cond, function (err, result) {
        res.json(result);
    });
}

