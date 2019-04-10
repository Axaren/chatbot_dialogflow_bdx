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

function readXML() {

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

    console.log("clear relations...");

    return new Promise( (resolve, reject) => {
        const requestCypher = 'match ()-[r:isUE]->() delete r';

        const resultPromise = session.run(requestCypher);

        resultPromise.then(() => {

            console.log("clear relations terminé !");
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