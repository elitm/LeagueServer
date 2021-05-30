const axios = require("axios");
const DButils = require("./DButils");
const games_utils = require("./games_utils");

const LEAGUE_ID = 271;

async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    next_game: await getNextGame()
  };
}

async function getNextGame(){

  const game = await DButils.execQuery(`SELECT TOP 1 *
  FROM games_db
  WHERE games_db.game_date > GETDATE()
  ORDER BY games_db.game_date `);
  const game_details = await games_utils.gamesDetails(game[0]);
  return await games_utils.extractRelevantGameData([game_details]);
}
exports.getLeagueDetails = getLeagueDetails;
