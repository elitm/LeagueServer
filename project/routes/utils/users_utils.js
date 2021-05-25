const DButils = require("./DButils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id}')`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
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


exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.markGamesAsFavorite = markGamesAsFavorite;
exports.getFavoriteGames = getFavoriteGames;
