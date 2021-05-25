var express = require("express");
var router = express.Router();
const games_utils = require("./utils/games_utils");



router.get("/:gameID", async (req, res, next) => {
    let game_details = [];
    try {
      const game_details = await games_utils.getGamesInfo(
        [req.params.gameID]
      );
      res.send(game_details);
    } catch (error) {
      next(error);
    }
  });
  
  module.exports = router;

  

