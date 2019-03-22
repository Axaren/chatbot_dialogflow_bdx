const neo4j = require('neo4j-driver').v1;
const uri = 'bolt://localhost:7687';

const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", "chatbot"));
const session = driver.session();

class Licence {

    constructor(id, name){
        this.ID = id;
        this.name = name;
        this.link = "https://www.u-bordeaux.fr/formation/" + this.ID;
    }

    addBdd(){

        const requestCypher = 'CREATE (a:LICENCE {name: $name, id: $id, link : $link}) RETURN a';

        const resultPromise = session.run(requestCypher,
            {
                id : this.ID,
                name : this.name,
                link : this.link
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

    linkTo(){

    }

}
module.exports = Licence;