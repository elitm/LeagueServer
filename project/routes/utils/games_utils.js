const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const teamUtils = require("./teams_utils");
const refereeUtils = require("./referee_utils");

async function getGamesInfo(games_ids_list) {
    let promises = [];
    games_ids_list.map((game_id) => promises.push(getGame(game_id)));
    let games_info = await Promise.all(promises);
    return games_info;
  }

  //function for one game query with game_id 
async function getGame(game_id){
    const q_games = await DButils.execQuery(
        `select local_team_id, visitor_team_id, game_date, local_team_score, visitor_team_score, field, referee_id from games_db where game_id='${game_id}'`);
    let GameDetail = await gamesDetails(q_games);
    return GameDetail;    
}

async function gamesDetails(q_games){
    const gameWithDetails = [];
    for(i=0; i < q_games.length; i++){
        let local_team_id = q_games[i].local_team_id;
        let visitor_team_id = q_games[i].visitor_team_id;
        let referee_id = q_games[i].referee_id;
      
        gameWithDetails[i] = q_games[i];
        gameWithDetails[i].local_team = teamUtils.getTeamName(local_team_id);
        gameWithDetails[i].visitor_team = teamUtils.getTeamName(visitor_team_id);
        gameWithDetails[i].referee = refereeUtils.getRefereeName(referee_id);
    }
    
    return gameWithDetails;
}

function extractRelevantGameData(games_info) {
    return games_info.map((game_info) => {
      const {local_team, visitor_team, game_date, local_team_score, visitor_team_score, field, referee_id } = game_info.data.data;
      //const { name } = game_info.data.data.team.data;
      return {
        local_team: local_team,
        visitor_team: visitor_team,
        game_date: game_date,
        local_team_score: local_team_score,
        visitor_team_score: visitor_team_score, 
        field: field, 
        referee_id: referee_id,
      };
    });
  }

  async function addGamesToSystem(local_team, visitor_team, game_date, local_team_score, visitor_team_score, field, referee_id){
    const add_game = await DButils.execQuery(
      `insert into games_db values('${local_team}','${visitor_team}','${game_date}','${local_team_score}','${visitor_team_score}','${fiels}','${referee_id}')`
    );
  }

  exports.getGamesInfo = getGamesInfo;
  exports.addGamesToSystem = addGamesToSystem;