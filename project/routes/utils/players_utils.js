const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
//  const TEAM_ID = 85;
const LEAGUE_ID = 271;

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad, league",
      api_token: process.env.api_token,
    },
  });
  if(team.data.data.league.data.id != LEAGUE_ID)
    throw {status: 403, message: "not in league 271"};
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersPreviewInfo(players_ids_list){
  players_info = await getPlayersInfo(players_ids_list);
  let val =  await extractPreviewPlayerData(players_info);
  return val;
  }


async function getPlayersFullInfo(players_ids_list){
  players_info = await getPlayersInfo(players_ids_list);
  return await extractFullPlayerData(players_info);
}


async function getPlayersInfo(players_ids_list) {
  try{
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return players_info;
    }
    catch{
      throw{status: 404, message: "player id does not exist"}
    }
}

function extractPreviewPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { player_id, fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

function extractPreviewPlayerSearch(player_obj){
  const { player_id, fullname, image_path, position_id } = player_obj;
  let team = player_obj.team;
  if (team == null) // if player doesnt have a team
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: position_id,
    };
  else{
    let name = player_obj.team.data.name;
    if(team.data.league && team.data.league.data.id == LEAGUE_ID)
      return {
        id: player_id,
        name: fullname,
        image: image_path,
        position: position_id,
        team_name: name,
      };
    }
}

function extractFullPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { player_id, fullname, image_path, position_id, common_name, nationality, birthdate, birthcountry, height, weight} = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      id: player_id,
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
      common_name: common_name,
      nationality: nationality,
      birthday: birthdate,
      birthcountry: birthcountry,
      height: height,
      weight: weight
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersPreviewInfo(player_ids_list);
  return players_info;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersPreviewInfo = getPlayersPreviewInfo;
exports.getPlayersFullInfo = getPlayersFullInfo;
exports.extractPreviewPlayerSearch = extractPreviewPlayerSearch;

