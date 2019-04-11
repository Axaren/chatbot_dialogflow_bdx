class UE {

    constructor(id, name, obj, keywords, session){
        this.ID = id;
        this.name = name;
        this.objectifs = obj;
        this.keywords = keywords;
        if (!this.keywords)
            this.keywords = [];
        this.session = session;
    }

    addBdd(){

        return new Promise( (resolve, reject) => {

            const requestCypher = 'CREATE (a:UE {name: $name, id: $id, objectifs : $objectifs, keywords : $keywords}) RETURN a';

            const resultPromise = this.session.run(requestCypher,
                {
                    id : this.ID,
                    name : this.name,
                    objectifs : this.objectifs,
                    keywords : this.keywords
                }
            );

            resultPromise.then(() => {
                resolve();
            }).catch( (err) => {
                reject(err);
            });
        });


    }

    linkTo(semestreName){

        /*console.log("Dans link de : " + this.name);*/

        return new Promise( (resolve, reject) => {

            const requestCypher = 'match (u:UE),(s:SEMESTRE) where u.name = "' + this.name + '" and s.name = "'+ semestreName +'" merge (u)-[r:isUE]->(s) return r;';
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