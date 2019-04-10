var http = require('http');
var parseString = require('xml2js').parseString;
var fs = require('fs');

var server = http.createServer(function (req, res) {
    if (typeof process.argv[2] === "undefined") {
        console.log("AIDE: node parser.js {fichier XML à parser}");
    }
    else {
        var keywords = [];
        fs.readFile('keywords', 'utf-8', function (err, buf) {
            if (err) throw err;
            var lineReader = require('readline').createInterface({ input: require('fs').createReadStream('keywords') });
            lineReader.on('line', function (line) {
                keywords.push(line);
            });
        })

        fs.readFile(process.argv[2], 'utf-8', function (err, buf) {
            if (err) throw err;
            parseString(buf, function (err, result) {
                result.CDM['ns3:course'].forEach(element => {
                        var courseID = (((element['ns3:courseID'])[0]._).replace(/\n|\r/g, ""));
                        var courseName = (((element['ns3:courseName'])[0]._).replace(/\n|\r/g, ""));
                        if (typeof ((element['ns3:learningObjectives'])[0]._) !== "undefined") {
                            var description = (((element['ns3:learningObjectives'])[0]._));
                            description = description.replace(/\n|\r/g, "").replace(".", " ");
                            var splitDescription = description.split(' ');
                            var keywordsFound = [];
                            keywords.forEach(keyword => {
                                for (var i = 0; i < splitDescription.length; i++) {
                                    if (splitDescription[i].includes("'")) {
                                        splitDescription[i] = splitDescription[i].substr(splitDescription[i].indexOf("'"), splitDescription[i].length);
                                        splitDescription[i] = splitDescription[i].replace("'", "");
                                    }
                                    if (splitDescription[i] === keyword && keywordsFound.indexOf(keyword) === -1) {
                                        keywordsFound.push(splitDescription[i]);
                                    }
                                }
                            });
                        }
                        else {
                            var description = courseName;
                        }
                });
            });
        });
    }
});
server.listen(8080);
