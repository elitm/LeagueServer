const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

const DButils = require("./DButils");

async function getGamesByTeamID(team_id) {
    const team_games = await DButils.execQuery(
      `select * from dbo.games_db where local_team_id='${team_id}' or visitor_team_id='${team_id}'`
    );
    return team_games;
  }

  exports.getGamesByTeamID = getGamesByTeamID