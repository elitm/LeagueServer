var express = require("express");
var router = express.Router();
const games_utils = require("./utils/games_utils");

const league_manager = 'elit';

// only league manager can access these functions - add game, add scores....
router.use(async function (req, res, next) {
  if (req.session && req.session.username && req.session.username === league_manager){
    req.username = req.session.username;
    next();
  }
  else {
    res.status(401).send("user not authorized");
  }
  
});

// add a game that is scheduled for the future - no scores yet
router.post("/addGame", async (req, res, next) => {
  try {
    await games_utils.addGame(req.body.local_team_id, req.body.visitor_team_id, req.body.game_date, 
       req.body.field_name , req.body.referee_id);
    res.status(201).send("game added successfully");
  } catch (error) {
    next(error);
  }
});

router.post("/updateGameScores", async (req, res, next) => {
  try {
    if (!await games_utils.gameIdExists(req.body.game_id))
      res.status(404).send("game id does not exist");
    else if (!await games_utils.checkDatePassed(req.body.game_id))
      res.status(405).send("cannot update scores of a game that has not happened yet");
    else{
      await games_utils.updateScores(req.body.game_id, req.body.local_team_score, req.body.visitor_team_score);
      res.status(201).send("scores updated successfully");
    }
  } catch (error) {
    next(error);
  }
});


router.post("/addEvent", async (req, res, next) => {
  try {

    await games_utils.addEvent(req.body.event_time, req.body.minute_in_game, req.body.event_description, req.body.type, req.body.game_id);
    res.status(201).send("event added successfully");
  } catch (error) {
    next(error);
  }
});
  
  module.exports = router;

  

