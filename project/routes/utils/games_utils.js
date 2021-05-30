const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const teamUtils = require("./teams_utils");
const refereeUtils = require("./referee_utils");

async function getGames(){
  const games_ids = await DButils.execQuery(`select game_id from games_db`);
  const ids = [];
  games_ids.map((game_obj) => ids.push(game_obj.game_id));
  return await getGamesInfo(ids);
}

async function getGamesInfo(games_ids_list) {
    let promises = [];
    games_ids_list.map((game_id) => promises.push(getGame(game_id)));
    let games_info = await Promise.all(promises);
    return await extractRelevantGameData(games_info);
  }

  //function for one game query with game_id 
async function getGame(game_id){
    const q_games = await DButils.execQuery(
        `select local_team_id, visitor_team_id, game_date, local_team_score, visitor_team_score, field, referee_id from games_db where game_id='${game_id}'`);
    let GameDetail = await gamesDetails(q_games[0]);
    return GameDetail;    
}

async function gamesDetails(q_games){
  const gameWithDetails = [];
    
    let local_team_id = q_games.local_team_id;
    let visitor_team_id = q_games.visitor_team_id;
    let referee_id = q_games.referee_id;

    gameWithDetails.local_team = await teamUtils.getTeamName(local_team_id);
    gameWithDetails.visitor_team = await teamUtils.getTeamName(visitor_team_id);
    gameWithDetails.game_date = q_games.game_date;
    gameWithDetails.field = q_games.field;
    gameWithDetails.referee = await refereeUtils.getRefereeName(referee_id);
    
  
  return gameWithDetails;
}
function extractRelevantGameData(games_info) {
    return games_info.map((game_info) => {
      const {local_team, visitor_team, game_date, local_team_score, visitor_team_score, field, referee } = game_info;
      //const { name } = game_info.data.data.team.data;
      return {
        local_team: local_team,
        visitor_team: visitor_team,
        game_date: game_date,
        local_team_score: local_team_score,
        visitor_team_score: visitor_team_score, 
        field: field, 
        referee: referee,
      };
    });
  }

async function addGame(local_team_id, visitor_team_id, game_date, field_name, referee_id){
  await DButils.execQuery(
    `insert into games_db (local_team_id, visitor_team_id, game_date, field, referee_id) 
    values('${local_team_id}','${visitor_team_id}','${game_date}','${field_name}','${referee_id}')`
  );
}

async function updateScores(game_id, local_team_score, visitor_team_score){
  await DButils.execQuery(
  `update games_db set local_team_score = '${local_team_score}', visitor_team_score = '${visitor_team_score}'
  where game_id='${game_id}'`
  );
}

// returns true if date passed, otherwise false
async function checkDatePassed(game_id){
  const game = await getGame(game_id);
  if (game[0].game_date < new Date()) //game needs to have happened already to add score
    return true;
  return false;
}

async function addEvent(date_time, minute, description, type, game_id){
  await DButils.execQuery(
    `insert into events_db (event_datetime, game_minute, event_description, event_name, game_id)
    values ('${date_time}', '${minute}', '${description}', '${type}', '${game_id}')`
  );
}

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

exports.getGamesInfo = getGamesInfo;
exports.addGame = addGame;
exports.updateScores = updateScores;
exports.addEvent = addEvent;
exports.splitPastFutureGames = splitPastFutureGames;
exports.checkDatePassed = checkDatePassed;
exports.getGames = getGames;