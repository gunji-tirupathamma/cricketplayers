const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDBAndServer();

//get all players Details
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;

  const playerArray = await db.all(getPlayerQuery);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add New Player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
                            cricket_team(player_id,player_name,jersey_number,role)
                            VALUES(${player_id},
                                   "${player_name}",
                                   ${jersey_number},
                                  "${role}");`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//player get method

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayerQuery = `SELECT * FROM cricket_team WHERE player_id=playerId;`;
  const player = await db.get(getSinglePlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});
