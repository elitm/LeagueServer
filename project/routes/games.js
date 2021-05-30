var express = require("express");
var router = express.Router();
const games_utils = require("./utils/games_utils");

router.get("/viewGames", async (req, res, next) => {
    try {
      const games = await games_utils.getGames();
      res.send(games);
    } catch (error) {
      next(error);
    }
  });


module.exports = router;