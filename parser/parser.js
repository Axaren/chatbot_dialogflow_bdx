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
        });

        fs.readFile(process.argv[2], 'utf-8', function (err, buf) {
            var j=0;

            if (err) throw err;
            parseString(buf, function (err, result) {
                (result.CDM['ns3:program']).forEach(program => {
                    var nature = (program["ns2:programDescription"])[0].$.nature;
                    if (nature === "semestre") {
                        (((program["ns2:programStructure"])[0])['ns2:refProgram']).forEach(id => {
                            var name = ((((program['ns2:programName'])[0])['ns2:text'])[0]._);
                            if ((name.toUpperCase().includes("SEMESTRE 5"))||(name.toUpperCase().includes("SEMESTRE 6"))) {
                                (result.CDM['ns3:program']).forEach(program => {
                                    if ((program["ns3:programID"])[0]._ === id.$.ref) {
                                        program['ns2:programStructure'].forEach(structure => {
                                            structure['ns2:refCourse'].forEach(courseID => {
                                                var courseIDTmp = courseID.$.ref;
                                                result.CDM['ns3:course'].forEach(element => {
                                                    if (((element['ns3:courseID'])[0]._) === courseIDTmp) {
                                                        var courseName = (((element['ns3:courseName'])[0]._).replace(/\n|\r/g, ""));
                                                        if (typeof ((element['ns3:learningObjectives'])[0]._) !== "undefined") {
                                                            var description = (((element['ns3:learningObjectives'])[0]._));
                                                            description = description.replace(".", " ");
                                                            var splitDescription = description.split(' ');
                                                            var keywordsFound = [];
                                                            keywords.forEach(keyword => {
                                                                if (keyword.split(' ').length<=1){
                                                                for (var i = 0; i < splitDescription.length; i++) {
                                                                    if (splitDescription[i].includes("'")) {
                                                                        splitDescription[i] = splitDescription[i].substr(splitDescription[i].indexOf("'"), splitDescription[i].length);
                                                                        splitDescription[i] = splitDescription[i].replace("'", "");
                                                                    }
                                                                    if (splitDescription[i].toUpperCase() === keyword.toUpperCase() && keywordsFound.indexOf(keyword) === -1) {
                                                                        keywordsFound.push(splitDescription[i]);
                                                                    }
                                                                }
                                                               
                                                                }
                                                                else{
                                                                    if (description.toUpperCase().includes(keyword.toUpperCase()) && keywordsFound.indexOf(keyword) === -1) {
                                                                        keywordsFound.push(keyword);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            var description = courseName;
                                                        }

                                                        if (typeof keywordsFound === "undefined")
                                                            console.log(++j+"." +courseName + " [PAS DE DESCRIPTION]");
                                                        else if (keywordsFound.length>=1)
                                                            console.log(++j+"." +courseName + " : " + keywordsFound);
                                                        else 
                                                        console.log(++j+"." +courseName + " [PAS DE MOT CLEF TROUVE]");
                                                    }
                                                });
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }
});
server.listen(8080);
