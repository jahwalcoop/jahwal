var mongoose = require('mongoose');
var db = require('../routes/model/DB');
var async = require('async');
var fs = require('fs');

var create = function (file) {
    //json file을 읽어 zone을 만든다.
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + "file open error...");
            return;
        }

        data = JSON.parse(data);
        for (var i=0; i<data.length; i++) {
            var Zone = mongoose.model('Zone');
            var saveZone = new Zone(data[i]);
            saveZone
                .save(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("complete:"+result.Code);
                    }
                });
        }
    });
}

var filearg = process.argv[2];

if (filearg == "-h" || filearg == "--help" || filearg == null) {
    console.log("usage : node zoneadd.js <filename>")
    process.exit(0);
}
create(filearg);

//saveZone.save하기전에 프로세스가 끝나버릴수도...async를 써서 다시 만들어야...
//process.exit(0)