const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const player_utils = require("./players_utils");
const teams_utils = require("./teams_utils");
const LEAGUE_ID = 271;
const STAGE_ID = 77447500;

async function search(search_param){
    let players_res = await PlayerSearch(search_param);
    let teams_res = await TeamSearch(search_param);

    return{
        players: players_res,
        teams: teams_res,
    }
}

async function PlayerSearch(search_param){
    const info_player = await axios.get(`${api_domain}/players/search/${search_param}`,{
        params:{
            api_token: process.env.api_token,
            include: "team, team.league"
        },
    });

    let player_search = [];
    info_player.data.data.map((player) => player_search.push(player_utils.extractPreviewPlayerSearch(player)));
    
    player_search = player_search.filter(Boolean); // remove nulls
    return player_search;
}

async function TeamSearch(search_param){
    const info_team = await axios.get(`${api_domain}/teams/search/${search_param}`,{
        params:{
            api_token: process.env.api_token,
        },
    });

    let team_search = [];
    info_team.data.data.map((team) => team_search.push(team));


    return team_search;
}

exports.search = search;
