class Semestre {

    constructor(name, session){
        this.name = name;
        this.session = session;
    }

    addBdd(){

        return new Promise( (resolve, reject) => {
            const requestCypher = 'MERGE (s:SEMESTRE {name: $name}) RETURN s';

            const resultPromise = this.session.run(requestCypher,
                {
                    name : this.name,
                }
            );

            resultPromise.then(() => {
                resolve();
            }).catch( (err) => {
                reject(err);
            });
        });


    }

    linkTo(licenceName){

        return new Promise( (resolve, reject) => {

            const requestCypher = 'match (s:SEMESTRE),(l:LICENCE) where s.name = "' + this.name + '" and l.name = "'+ licenceName +'" merge (s)-[r:isSEMESTRE]->(l) return r;';
            const resultPromise = this.session.run(requestCypher);

            resultPromise.then(() => {
                resolve();
            }).catch( (err) => {
                reject(err);
            });
        });

    }

}
module.exports = Semestre;