var FileReader = require('FileReader')
var bufferConcat = require('buffer-concat')
var fs = require('fs');

var doc = fs.ReadStream('blankPDF.pdf').on('data', function (data) {
    console.log(doc)
})
