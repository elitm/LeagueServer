var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils")

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM dbo.users_db")
      .then((users) => {
        if (users.find((x) => x.username === req.session.username)) {
          req.username = req.session.username;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
  try {
    const username = req.session.username;
    const player_id = req.body.playerId;
    await users_utils.markPlayerAsFavorite(username, player_id);
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const username = req.session.username;
    let favorite_players = {};
    const player_ids = await users_utils.getFavoritePlayers(username);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.post("/favoriteGames", async (req, res, next) => {
  try {
    const username = req.session.username;
    const gameid = req.body.gameID;
    await users_utils.markGamesAsFavorite(username, gameid);
    res.status(201).send("The game successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites games that were saved by the logged-in user
 */
router.get("/favoriteGames", async (req, res, next) => {
  try {
    const username = req.session.username;
    const games_ids = await users_utils.getFavoriteGames(username);
    let games_ids_array = [];
    games_ids.map((element) => games_ids_array.push(element.game_id)); //extracting the games ids into array
    const results = await games_utils.getGamesInfo(games_ids_array); 
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

router.get("/lastSearch", async (req, res, next) => {
  try {
    if(req.session.username == null){
      next(new error("user is not authorized"))
    }
    const query = req.session.query;
    const lastSearch = req.session.lastSearch;
    
    if(query.length == 0){
      res.status(200).send("no past search for this user")
    }
    else{
      res.status(200).send(lastSearch);
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
