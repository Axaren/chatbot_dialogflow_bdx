var http = require('http');
var parseString = require('xml2js').parseString;
var fs = require('fs');
var sleep = require('sleep-sync')
var spawn = require("child_process").spawn;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

var server = http.createServer(function (req, res) {
    res.writeHead(200);

    fs.readFile('formation_licence_info.xml', 'utf-8', function (err, buf) {
        var i=0;
        parseString(buf, function (err, result) {
            result.CDM['ns3:course'].forEach(element => {
                var courseID =(((element['ns3:courseID'])[0]._).replace(/\n|\r/g, ""));
                var courseName = (((element['ns3:courseName'])[0]._).replace(/\n|\r/g, ""));
                if (typeof ((element['ns3:learningObjectives'])[0]._) !=="undefined"){
                    var description = (((element['ns3:learningObjectives'])[0]._).replace(/\n|\r/g, ""));
                    var pythonProcess = spawn('python',["script.py", description]);
                    pythonProcess.stdout.on('data', (data) => {
                        console.log(++i+". [Matière] "+ courseName +" [Keywords] "+ data);
                    });
                }
                else {
                    var description = courseName;
                }
                //sleep(500); not working
            });
        });
    });
    
});
server.listen(8080);
