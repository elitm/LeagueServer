const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

const DButils = require("./DButils");

async function getGamesByTeamID(team_id) {
    const team_games = await DButils.execQuery(
      `select * from dbo.games_db where local_team_id='${team_id}' or visitor_team_id='${team_id}'`
    );
    return splitPastFutureGames(team_games);
  }

<<<<<<< HEAD
async function splitPastFutureGames(team_games) {
    let curr_date = new Date();
    let past_games = [];
    let future_games = [];
    let all_games = []
    for(i=0; i < team_games.length; i++){
        if (team_games[i].game_date < curr_date)
            past_games.push(team_games[i])
        else
            future_games.push(team_games[i])
    }
    all_games.push(past_games);
    all_games.push(future_games);
    return all_games;
    }  

  exports.getGamesByTeamID = getGamesByTeamID
=======
>>>>>>> edaed07fc3fa106c468d38441c5e4346ed81c983

async function getTeamName(team_id){
  try {
    const team = await axios.get(`${api_domain}/teams/${team_id}`, {
      params: {
        api_token: process.env.api_token,
      },
    });
    return team.data.data.name;
  }
  catch{
    throw {status:404, message: "could not find team name"};
  }
}

exports.getGamesByTeamID = getGamesByTeamID
<<<<<<< HEAD
exports.getTeamName = getTeamName;
=======
exports.getTeamName = getTeamName;
>>>>>>> edaed07fc3fa106c468d38441c5e4346ed81c983
