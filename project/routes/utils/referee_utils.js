const DButils = require("./DButils");

async function getRefereeName(referee_id){
    const referee = await DButils.execQuery(
        `select users_db.firstname, users_db.lastname from users_db,referees_db 
        where users_db.username=referees_db.username and referees_db.refereeID='${referee_id}'`
    );

    let full_name="";
    if(referee.length>0){
        full_name= referee[0].firstname + referee[0].lastname;
    }
    return full_name;
}

exports.getRefereeName = getRefereeName;
