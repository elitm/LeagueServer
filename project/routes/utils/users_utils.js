const DButils = require("./DButils");
const player_utils = require("./players_utils");

async function markPlayerAsFavorite(username, player_id) {
  await DButils.execQuery(
    `insert into favoritePlayers_db values ('${username}',${player_id})`
  );
}

async function getFavoritePlayers(username) {
  const player_ids = await DButils.execQuery(
    `select player_id from favoritePlayers_db where username='${username}'`
  );
  return player_ids;
}

async function markGamesAsFavorite(username, game_id) {
  await DButils.execQuery(
    `insert into favoriteGames_db values ('${username}',${game_id})`
  );
}

async function getFavoriteGames(username) {
  const game_ids = await DButils.execQuery(
    `select game_id from favoriteGames_db where username='${username}'`
  );
  return game_ids;
}

async function canAddFavoriteGame(username, gameID){
  const row = await DButils.execQuery(
    `select game_id from favoriteGames_db where username='${username}' and game_id=${gameID}`
  );
  if (row.length == 0) // this row does not exist in table, can add as favorite
    return true;
  return false;
}


exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.markGamesAsFavorite = markGamesAsFavorite;
exports.getFavoriteGames = getFavoriteGames;
exports.canAddFavoriteGame = canAddFavoriteGame;
