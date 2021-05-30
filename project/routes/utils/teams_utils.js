const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

const DButils = require("./DButils");
const games_utils = require("./games_utils")

async function getGamesByTeamID(team_id) {
    const team_games = await DButils.execQuery(
      `select * from dbo.games_db where local_team_id='${team_id}' or visitor_team_id='${team_id}'`
    );
    return games_utils.splitPastFutureGames(team_games);
  }




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
exports.getTeamName = getTeamName;
