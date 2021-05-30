//var { query } = require("express");
var express = require("express");
// var session = require("express-session");
var router = express.Router();
const search_utils = require("./utils/search_utils");



router.get("/:name", async(req, res, next) =>{
    try{
        const search_res = await search_utils.search(req.params.name);

        if(req.session.username != null){
            req.session.query = req.params.name;
            req.session.lastSearch = search_res;
        }

        if(search_res.players.length == 0 && search_res.teams.length == 0)
            res.send(204);
        else
            res.send(search_res);

    } catch(error){
        next(error);
    }

})

module.exports = router;