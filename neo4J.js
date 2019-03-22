const UE = require('./UE');
const Licence = require('./Licence');
/*const neo4j = require('neo4j-driver').v1;
const uri = 'bolt://localhost:7687';

const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", "chatbot"));
const session = driver.session();*/

/*/!*const UEName = 'POO';
const ID = '4514785';
const Objectif = "Savoir coder en objet et faire des planète et des vaisseau pour être noté 12.5/20 (niceeeeeeeeee !!!!)";*!/
UE.Name = 'Systeme';
UE.ID = '4514787';
UE.Objectif = "Connaitre les commandes de base linux";


const requestUE = {cypher : 'CREATE (a:UE {name: $name, id: $id, objectif : $objectif}) RETURN a', param : {name: UE.Name, id : UE.ID, objectif : UE.Objectif } };


const resultPromise = session.run(requestUE.cypher, requestUE.param);

resultPromise.then(result => {
    session.close();

    const singleRecord = result.records[0];
    const node = singleRecord.get(0);

    console.log(node.properties.name);

    // on application exit:
    driver.close();
});*/


let Info = new Licence('PRLIIN_110', 'Informatique');

let Systeme = new UE('4512457', "Systeme", "Connaitre les commandes de base linux");
Systeme.addBdd();
Systeme.linkTo(Info.name);

const http = require('http');

const server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Salut tout le monde !');
});
server.listen(8080);