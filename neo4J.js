const parseString = require('xml2js').parseString;
const fs = require('fs');
const http = require('http');
require('events').EventEmitter.defaultMaxListeners = 15;

const neo4j = require('neo4j-driver').v1;
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", "chatbot"));
const session = driver.session();

const UE = require('./UE');
const Licence = require('./Licence');
const Semestre = require('./Semestre');

/*
match ()-[r:isUE]->() delete r;
*/

const server = http.createServer(function (req, res) {

    if (req.url != '/favicon.ico') {

        clearBdd().then( () => {


            readXML().then(() => {
                res.writeHead(200);


                session.close();
                driver.close();
                res.end();
            });
        })
    }

});

server.listen(8080);

function readXML () {

    console.log("readXML... ");

    return new Promise((resolve, reject) => {

        let Info = new Licence('PRLIIN_110', 'Informatique', session);

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

            Info.addBdd().then( () => {

                fs.readFile(process.argv[2], 'utf-8', function (err, buf) {
                    var j=0;

                    if (err) throw err;
                    parseString(buf, function (err, result) {
                        (result.CDM['ns3:program']).forEach( (program, index) => {
                            var nature = (program["ns2:programDescription"])[0].$.nature;
                            if (nature === "semestre") {
                                (((program["ns2:programStructure"])[0])['ns2:refProgram']).forEach(id => {
                                    var name = ((((program['ns2:programName'])[0])['ns2:text'])[0]._); // name = semestre
                                    if ((name.toUpperCase().includes("SEMESTRE 5"))||(name.toUpperCase().includes("SEMESTRE 6"))) {
                                        (result.CDM['ns3:program']).forEach(program => {
                                            if ((program["ns3:programID"])[0]._ === id.$.ref) {
                                                program['ns2:programStructure'].forEach(structure => {
                                                    structure['ns2:refCourse'].forEach(courseID => {
                                                        var courseIDTmp = courseID.$.ref;
                                                        result.CDM['ns3:course'].forEach( (element, index2) => {
                                                            if (((element['ns3:courseID'])[0]._) === courseIDTmp) {
                                                                var courseName = (((element['ns3:courseName'])[0]._).replace(/\n|\r/g, ""));
                                                                if (typeof ((element['ns3:learningObjectives'])[0]._) !== "undefined") {
                                                                    var description = (((element['ns3:learningObjectives'])[0]._));
                                                                    description = description.replace(".", " ");
                                                                    var splitDescription = description.split(' ');
                                                                    var keywordsFound = [];
                                                                    keywords.forEach(keyword => {
                                                                        for (var i = 0; i < splitDescription.length; i++) {
                                                                            if (splitDescription[i].includes("'")) {
                                                                                splitDescription[i] = splitDescription[i].substr(splitDescription[i].indexOf("'"), splitDescription[i].length);
                                                                                splitDescription[i] = splitDescription[i].replace("'", "");
                                                                            }
                                                                            if (splitDescription[i].toUpperCase() === keyword.toUpperCase() && keywordsFound.indexOf(keyword) === -1) {
                                                                                keywordsFound.push(splitDescription[i]);
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    var description = courseName;
                                                                }

                                                                console.log(courseName);
                                                                console.log(keywordsFound);
                                                                console.log("\n");


                                                                let semestre = new Semestre(name, session);
                                                                let ue;
                                                                if (keywordsFound !== undefined)
                                                                    ue = new UE(courseIDTmp, courseName, description, keywordsFound, session);
                                                                else
                                                                    ue = new UE(courseIDTmp, courseName, description, courseName, session);

                                                                semestre.addBdd().then( () => {
                                                                    semestre.linkTo(Info.name).then( () => {

                                                                        ue.addBdd().then( () => {

                                                                            ue.linkTo(semestre.name).then( () => {

                                                                                if (index2+1 === result.CDM['ns3:course'].length){
                                                                                    console.log("Fin readXML !!");
                                                                                    resolve();
                                                                                }
                                                                            });

                                                                        }).catch( (err) => {
                                                                            console.log(err);
                                                                        });
                                                                    })
                                                                });
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

            });


        }

    });
}

function readXML2() {

    console.log("readXML... ");

    let Info = new Licence('PRLIIN_110', 'Informatique', session);

    return new Promise((resolve, reject) => {
        let description, courseID, courseName;

        Info.addBdd().then(() => {
            fs.readFile('formation_licence_info.xml', 'utf-8', function (err, buf) {
                parseString(buf, function (err, result) {

                    console.log("Nb elements : " + result.CDM['ns3:course'].length);

                    for (let i = 0; i < result.CDM['ns3:course'].length; i++){

                        courseID = (((result.CDM['ns3:course'][i]['ns3:courseID'])[0]._).replace(/\n|\r/g, ""));
                        courseName = (((result.CDM['ns3:course'][i]['ns3:courseName'])[0]._).replace(/\n|\r/g, ""));

                        if (typeof ((result.CDM['ns3:course'][i]['ns3:learningObjectives'])[0]._) !== "undefined") {
                            description = (((result.CDM['ns3:course'][i]['ns3:learningObjectives'])[0]._).replace(/\n|\r/g, ""));
                        } else {
                            description = courseName;
                        }

                        let ue = new UE(courseID, courseName, description, session);

                        ue.addBdd().then( () => {

                            ue.linkTo(Info.name).then( () => {

                                if (i+1 === result.CDM['ns3:course'].length){
                                    console.log("readXML terminé !");
                                    resolve();
                                }
                            });

                        }).catch( (err) => {
                            console.log(err);
                        });
                    }
                });

            });
        });
    });



}

function clearBdd(){

    console.log("clear...");

    return new Promise( (resolve, reject) => {
        clearRelations().then( () => {

            clearNode().then( () => {
                resolve();
            }).catch( (err) => {
                reject(err);
            })

        }).catch( (err) => {
            reject(err);
        })
    });

}

function clearRelations(){

    return new Promise( (resolve, reject) => {

        clearUERelation().then( () => {
            clearSemestreRelation().then( () => {
                resolve();
            }).catch( (err) => {
                reject(err);
            })
        }).catch( (err) => {
            reject(err);
        })
    })


}

function clearUERelation(){

    console.log("clear UE relations...");

    return new Promise( (resolve, reject) => {
        const requestCypher = 'match ()-[r:isUE]->() delete r';

        const resultPromise = session.run(requestCypher);

        resultPromise.then(() => {

            console.log("clear UE relations terminé !");
            resolve();

        }).catch( (err) => {
            reject(err);
        });
    });
}

function clearSemestreRelation(){

    console.log("clear Semestre relations...");

    return new Promise( (resolve, reject) => {
        const requestCypher = 'match ()-[r:isSEMESTRE]->() delete r';

        const resultPromise = session.run(requestCypher);

        resultPromise.then(() => {

            console.log("clear Semestre relations terminé !");
            resolve();

        }).catch( (err) => {
            reject(err);
        });
    });
}

function clearNode(){

    console.log("clear node...");

    return new Promise( (resolve, reject) => {
        const requestCypher = 'match (a) delete a';

        const resultPromise = session.run(requestCypher);

        resultPromise.then(() => {
            console.log("clear node terminé !");
            resolve();

        }).catch( (err) => {
            reject(err);
        });
    });
}

function getAllUE(){

    let tabUE = [];

    return new Promise( (resolve, reject) => {
        const requestCypher = 'match (ue:UE) return ue';

        const resultPromise = session.run(requestCypher);

        resultPromise.then((result) => {

            for (let i = 0; i < result.records.length; i++){

                //console.log(result.records[i].get(0).properties);
                tabUE.push(result.records[i].get(0).properties);

                if (i+1 === result.records.length){
                    resolve(tabUE);
                }
            }
        }).catch( (err) => {
            reject(err);
        });
    });
}