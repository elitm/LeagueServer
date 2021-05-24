var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  let team_details = [];
  try {
    const player_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    const game_details = await teams_utils.getGamesByTeamID(
      req.params.teamId
    );
    team_details.push(player_details);
    team_details.push(game_details);

    res.send(team_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
