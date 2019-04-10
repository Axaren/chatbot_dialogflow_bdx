class Licence {

    constructor(id, name, session){
        this.ID = id;
        this.name = name;
        this.link = "https://www.u-bordeaux.fr/formation/" + this.ID;
        this.session = session;
    }

    addBdd(){

        console.log("Dans addBdd de licence");

        return new Promise( (resolve, reject) => {
            const requestCypher = 'CREATE (a:LICENCE {name: $name, id: $id, link : $link}) RETURN a';

            const resultPromise = this.session.run(requestCypher,
                {
                    id : this.ID,
                    name : this.name,
                    link : this.link
                }
            );

            resultPromise.then(() => {
                resolve();
            }).catch( (err) => {
                reject(err);
            });
        });


    }

    linkTo(){

    }

}
module.exports = Licence;