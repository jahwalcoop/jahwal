var xlsx = require('node-xlsx');

var buffer = xlsx.build({worksheets: [
    {"name":"mySheetName", "data":[
        ["A1", "B1"],
        [
            {"value":"A2","formatCode":"General"},
            {"value":"B2","formatCode":"General"}
        ],
        [
            {"value":"A3","formatCode":"General"},
            {"value":"B3","formatCode":"General"}
        ]
    ]}
]}); // returns a buffer

var fs = require('fs');
var path = 'file.xlsx';

fs.open(path, 'w', function(err, fd) {
    if (err) {
        throw 'error opening file: ' + err;
    } else {
        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('file written');
            })
        });
    }
});