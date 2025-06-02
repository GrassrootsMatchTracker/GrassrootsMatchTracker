from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import motor.motor_asyncio
import os
from dotenv import load_dotenv
import uuid
import base64
import json

load_dotenv()

app = FastAPI(title="Grassroots Match Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/grassroots_tracker")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.grassroots_tracker

# Security
security = HTTPBearer()

# WebSocket manager for real-time features
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Pydantic Models
class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: Optional[str] = None  # Base64 encoded image
    primary_color: str = "#000000"
    secondary_color: str = "#ffffff"
    founded_year: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    name: str
    squad_number: int
    position: str  # GK, DEF, MID, FWD
    photo: Optional[str] = None  # Base64 encoded image
    age: Optional[int] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    nationality: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Formation(BaseModel):
    name: str
    positions: List[Dict[str, Any]]  # Position coordinates and roles

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team_id: str
    away_team_id: str
    match_type: str  # Friendly, League, Cup
    match_date: datetime
    venue: str
    status: str = "scheduled"  # scheduled, live, completed, cancelled
    home_score: int = 0
    away_score: int = 0
    home_formation: Optional[str] = None
    away_formation: Optional[str] = None
    home_lineup: List[str] = []  # Player IDs
    away_lineup: List[str] = []
    home_substitutes: List[str] = []
    away_substitutes: List[str] = []
    match_events: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MatchEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    event_type: str  # goal, assist, substitution, yellow_card, red_card, player_of_match
    player_id: str
    team_id: str
    minute: int
    additional_data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PlayerStats(BaseModel):
    player_id: str
    team_id: str
    appearances: int = 0
    goals: int = 0
    assists: int = 0
    games_started: int = 0
    games_as_substitute: int = 0
    player_of_match_awards: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    minutes_played: int = 0

# Formations data
FORMATIONS = {
    "4-4-2": {
        "name": "4-4-2",
        "positions": [
            {"role": "GK", "x": 50, "y": 10},
            {"role": "RB", "x": 80, "y": 30}, {"role": "CB", "x": 60, "y": 30},
            {"role": "CB", "x": 40, "y": 30}, {"role": "LB", "x": 20, "y": 30},
            {"role": "RM", "x": 80, "y": 60}, {"role": "CM", "x": 60, "y": 60},
            {"role": "CM", "x": 40, "y": 60}, {"role": "LM", "x": 20, "y": 60},
            {"role": "ST", "x": 60, "y": 85}, {"role": "ST", "x": 40, "y": 85}
        ]
    },
    "4-3-3": {
        "name": "4-3-3",
        "positions": [
            {"role": "GK", "x": 50, "y": 10},
            {"role": "RB", "x": 80, "y": 30}, {"role": "CB", "x": 60, "y": 30},
            {"role": "CB", "x": 40, "y": 30}, {"role": "LB", "x": 20, "y": 30},
            {"role": "CM", "x": 70, "y": 55}, {"role": "CM", "x": 50, "y": 50}, {"role": "CM", "x": 30, "y": 55},
            {"role": "RW", "x": 80, "y": 85}, {"role": "ST", "x": 50, "y": 85}, {"role": "LW", "x": 20, "y": 85}
        ]
    },
    "3-5-2": {
        "name": "3-5-2",
        "positions": [
            {"role": "GK", "x": 50, "y": 10},
            {"role": "CB", "x": 70, "y": 30}, {"role": "CB", "x": 50, "y": 30}, {"role": "CB", "x": 30, "y": 30},
            {"role": "RWB", "x": 85, "y": 55}, {"role": "CM", "x": 65, "y": 55}, {"role": "CM", "x": 50, "y": 50},
            {"role": "CM", "x": 35, "y": 55}, {"role": "LWB", "x": 15, "y": 55},
            {"role": "ST", "x": 60, "y": 85}, {"role": "ST", "x": 40, "y": 85}
        ]
    },
    "4-2-3-1": {
        "name": "4-2-3-1",
        "positions": [
            {"role": "GK", "x": 50, "y": 10},
            {"role": "RB", "x": 80, "y": 30}, {"role": "CB", "x": 60, "y": 30},
            {"role": "CB", "x": 40, "y": 30}, {"role": "LB", "x": 20, "y": 30},
            {"role": "CDM", "x": 60, "y": 50}, {"role": "CDM", "x": 40, "y": 50},
            {"role": "RAM", "x": 75, "y": 70}, {"role": "CAM", "x": 50, "y": 70}, {"role": "LAM", "x": 25, "y": 70},
            {"role": "ST", "x": 50, "y": 85}
        ]
    },
    "5-3-2": {
        "name": "5-3-2",
        "positions": [
            {"role": "GK", "x": 50, "y": 10},
            {"role": "RWB", "x": 85, "y": 30}, {"role": "CB", "x": 65, "y": 30}, {"role": "CB", "x": 50, "y": 30},
            {"role": "CB", "x": 35, "y": 30}, {"role": "LWB", "x": 15, "y": 30},
            {"role": "CM", "x": 65, "y": 60}, {"role": "CM", "x": 50, "y": 55}, {"role": "CM", "x": 35, "y": 60},
            {"role": "ST", "x": 60, "y": 85}, {"role": "ST", "x": 40, "y": 85}
        ]
    }
}

# API Routes

@app.get("/")
async def root():
    return {"message": "Grassroots Match Tracker API", "version": "1.0.0"}

# Teams endpoints
@app.post("/api/teams", response_model=Team)
async def create_team(team: Team):
    team_dict = team.dict()
    await db.teams.insert_one(team_dict)
    return team

@app.get("/api/teams", response_model=List[Team])
async def get_teams():
    teams = await db.teams.find().to_list(length=None)
    return teams

@app.get("/api/teams/{team_id}", response_model=Team)
async def get_team(team_id: str):
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@app.put("/api/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, team: Team):
    team_dict = team.dict()
    result = await db.teams.replace_one({"id": team_id}, team_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@app.delete("/api/teams/{team_id}")
async def delete_team(team_id: str):
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}

# Players endpoints
@app.post("/api/players", response_model=Player)
async def create_player(player: Player):
    player_dict = player.dict()
    await db.players.insert_one(player_dict)
    return player

@app.get("/api/teams/{team_id}/players", response_model=List[Player])
async def get_team_players(team_id: str):
    players = await db.players.find({"team_id": team_id}).to_list(length=None)
    return players

@app.get("/api/players/{player_id}", response_model=Player)
async def get_player(player_id: str):
    player = await db.players.find_one({"id": player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@app.put("/api/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player: Player):
    player_dict = player.dict()
    result = await db.players.replace_one({"id": player_id}, player_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@app.delete("/api/players/{player_id}")
async def delete_player(player_id: str):
    result = await db.players.delete_one({"id": player_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Player deleted successfully"}

# Formations endpoints
@app.get("/api/formations")
async def get_formations():
    return FORMATIONS

@app.get("/api/formations/{formation_name}")
async def get_formation(formation_name: str):
    if formation_name not in FORMATIONS:
        raise HTTPException(status_code=404, detail="Formation not found")
    return FORMATIONS[formation_name]

# Matches endpoints
@app.post("/api/matches", response_model=Match)
async def create_match(match: Match):
    match_dict = match.dict()
    await db.matches.insert_one(match_dict)
    return match

@app.get("/api/matches", response_model=List[Match])
async def get_matches():
    matches = await db.matches.find().to_list(length=None)
    return matches

@app.get("/api/matches/{match_id}", response_model=Match)
async def get_match(match_id: str):
    match = await db.matches.find_one({"id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@app.put("/api/matches/{match_id}", response_model=Match)
async def update_match(match_id: str, match: Match):
    match_dict = match.dict()
    result = await db.matches.replace_one({"id": match_id}, match_dict)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Match not found")
    await manager.broadcast(f"match_updated:{match_id}")
    return match

# Match Events endpoints
@app.post("/api/match-events", response_model=MatchEvent)
async def create_match_event(event: MatchEvent):
    event_dict = event.dict()
    await db.match_events.insert_one(event_dict)
    
    # Update player statistics
    await update_player_statistics(event.player_id, event.event_type)
    
    # Broadcast to websocket connections
    await manager.broadcast(f"match_event:{event.match_id}:{json.dumps(event_dict, default=str)}")
    return event

@app.get("/api/matches/{match_id}/events", response_model=List[MatchEvent])
async def get_match_events(match_id: str):
    events = await db.match_events.find({"match_id": match_id}).to_list(length=None)
    return events

# Statistics endpoints
@app.get("/api/players/{player_id}/stats", response_model=PlayerStats)
async def get_player_stats(player_id: str):
    stats = await db.player_stats.find_one({"player_id": player_id})
    if not stats:
        # Create empty stats if none exist
        stats = PlayerStats(player_id=player_id, team_id="")
        await db.player_stats.insert_one(stats.dict())
    return stats

@app.get("/api/teams/{team_id}/stats")
async def get_team_stats(team_id: str):
    players = await db.players.find({"team_id": team_id}).to_list(length=None)
    team_stats = []
    
    for player in players:
        stats = await db.player_stats.find_one({"player_id": player["id"]})
        if stats:
            stats["player_name"] = player["name"]
            stats["squad_number"] = player["squad_number"]
            team_stats.append(stats)
    
    return team_stats

# Helper function to update player statistics
async def update_player_statistics(player_id: str, event_type: str):
    stats = await db.player_stats.find_one({"player_id": player_id})
    
    if not stats:
        player = await db.players.find_one({"id": player_id})
        stats = PlayerStats(player_id=player_id, team_id=player["team_id"])
        stats_dict = stats.dict()
    else:
        stats_dict = stats
    
    # Update based on event type
    if event_type == "goal":
        stats_dict["goals"] += 1
    elif event_type == "assist":
        stats_dict["assists"] += 1
    elif event_type == "player_of_match":
        stats_dict["player_of_match_awards"] += 1
    elif event_type == "yellow_card":
        stats_dict["yellow_cards"] += 1
    elif event_type == "red_card":
        stats_dict["red_cards"] += 1
    
    await db.player_stats.replace_one(
        {"player_id": player_id}, 
        stats_dict, 
        upsert=True
    )

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
