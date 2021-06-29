const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const teamUtils = require("./teams_utils");
const refereeUtils = require("./referee_utils");

async function getGames(){
  const games_ids = await DButils.execQuery(`select game_id from games_db`);
  const ids = [];
  games_ids.map((game_obj) => ids.push(game_obj.game_id));
  const events_promises = [];

  // ids.map((id) => events_promises.push(getEventsOfGame(id)));
  // let events = await Promise.all(events_promises);
  const games_info = await getGamesInfo(ids);
  const split_games = await splitPastFutureGames(games_info);
  // events = events.filter(item => item.length > 0); // remove empty arrays (games that dont have events)
  // return [split_games, events];
  return [split_games];

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
        `select game_id, local_team_id, visitor_team_id, game_date, local_team_score, visitor_team_score, field, referee_id from games_db where game_id='${game_id}'`);
    let GameDetail = await gamesDetails(q_games[0]);

    return GameDetail;    
}

async function gamesDetails(q_games){
  const gameWithDetails = [];
    
    let local_team_id = q_games.local_team_id;
    let visitor_team_id = q_games.visitor_team_id;
    // let referee_id = q_games.referee_id;
    gameWithDetails.game_id = q_games.game_id;
    gameWithDetails.local_team_id = local_team_id;
    gameWithDetails.visitor_team_id = visitor_team_id;
    gameWithDetails.local_team = await teamUtils.getTeamName(local_team_id);
    gameWithDetails.visitor_team = await teamUtils.getTeamName(visitor_team_id);
    gameWithDetails.game_date = q_games.game_date;
    gameWithDetails.local_team_score = q_games.local_team_score;
    gameWithDetails.visitor_team_score = q_games.visitor_team_score;
    gameWithDetails.field = q_games.field;
    gameWithDetails.events = await getEventsOfGame(q_games.game_id);
    // gameWithDetails.referee = await refereeUtils.getRefereeName(referee_id);
    // gameWithDetails.events = gameWithDetails.events.filter(item => item.length > 0); // remove empty arrays (games that dont have events)
    
  return gameWithDetails;
}
function extractRelevantGameData(games_info) {
    return games_info.map((game_info) => {
      const {game_id, local_team_id, visitor_team_id, local_team, visitor_team, game_date, local_team_score, visitor_team_score, field, events} = game_info;
      //const { name } = game_info.data.data.team.data;
      return {
        game_id: game_id,
        local_team_id: local_team_id,
        visitor_team_id: visitor_team_id,
        local_team: local_team,
        visitor_team: visitor_team,
        game_date: game_date,
        local_team_score: local_team_score,
        visitor_team_score: visitor_team_score, 
        field: field, 
        // referee: referee,
        events: events
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
  if (game.game_date < new Date()) //game needs to have happened already to add score
    return true;
  return false;
}

async function addEvent(date_time, minute, description, type, game_id){
  const game = await getGame(game_id);
  if (game.game_date > new Date())
    throw{status:400, message: "cannot add event to a game that has not happened yet"}
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
          past_games.push(await gamesDetails(team_games[i]))
      else
          future_games.push(await gamesDetails(team_games[i]))
  }
  all_games.push(extractRelevantGameData(past_games));
  all_games.push(extractRelevantGameData(future_games));
  return all_games;
  } 


async function gameIdExists(game_id){
  const count_games = await DButils.execQuery(`select game_id from games_db where game_id=${game_id}`)
  if (count_games.length == 0)
    return false;
  return true;
}

async function getEventsOfGame(game_id){
  return await DButils.execQuery(`select game_id, event_datetime, game_minute, event_description, event_name from events_db where game_id=${game_id}`);
}


exports.getGamesInfo = getGamesInfo;
exports.addGame = addGame;
exports.updateScores = updateScores;
exports.addEvent = addEvent;
exports.splitPastFutureGames = splitPastFutureGames;
exports.checkDatePassed = checkDatePassed;
exports.getGames = getGames;
exports.extractRelevantGameData = extractRelevantGameData;
exports.gamesDetails = gamesDetails;
exports.gameIdExists = gameIdExists
