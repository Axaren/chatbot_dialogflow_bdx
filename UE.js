class UE {

    constructor(id, name, obj, session){
        this.ID = id;
        this.name = name;
        this.objectifs = obj;
        this.session = session;
    }

    addBdd(){

        return new Promise( (resolve, reject) => {

            const requestCypher = 'CREATE (a:UE {name: $name, id: $id, objectifs : $objectifs}) RETURN a';

            const resultPromise = this.session.run(requestCypher,
                {
                    id : this.ID,
                    name : this.name,
                    objectifs : this.objectifs
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

        /*console.log("Dans link de : " + this.name);*/

        return new Promise( (resolve, reject) => {

            const requestCypher = 'match (u:UE),(l:LICENCE) where u.name = "' + this.name + '" and l.name = "'+ licenceName +'" create (u)-[r:isUE]->(l) return r;';
            const resultPromise = this.session.run(requestCypher);

            resultPromise.then(() => {
                resolve();
            }).catch( (err) => {
                reject(err);
            });
        });
    }

}
module.exports = UE;