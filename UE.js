const neo4j = require('neo4j-driver').v1;
const uri = 'bolt://localhost:7687';

const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", "chatbot"));
const session = driver.session();

class UE {

    constructor(id, name, obj){
        this.ID = id;
        this.name = name;
        this.objectifs = obj;
    }

    addBdd(){

        const requestCypher = 'CREATE (a:UE {name: $name, id: $id, objectifs : $objectifs}) RETURN a';

        const resultPromise = session.run(requestCypher,
            {
                id : this.ID,
                name : this.name,
                objectifs : this.objectifs
            }
            );

        resultPromise.then(result => {
            session.close();

            const singleRecord = result.records[0];
            const node = singleRecord.get(0);

            console.log(node.properties.name);

            // on application exit:
            driver.close();
        });
    }

    linkTo(licenceName){
        const requestCypher = 'match (u:UE),(l:LICENCE) where u.name = "' + this.name + '" and l.name = "'+ licenceName +'" create (u)-[r:isUE]->(l) return r;';
        const resultPromise = session.run(requestCypher);

        resultPromise.then(result => {
            session.close();

            // on application exit:
            driver.close();
        });
    }

}
module.exports = UE;