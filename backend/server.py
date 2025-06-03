from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import json
import uuid
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

# Custom JSON encoder to handle MongoDB ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Custom JSONResponse class
class CustomJSONResponse(JSONResponse):
    def render(self, content):
        return json.dumps(content, cls=CustomJSONEncoder).encode("utf-8")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.grassroots_tracker

# Helper function to convert MongoDB document to dict
def doc_to_dict(doc):
    if doc is None:
        return None
    doc_dict = dict(doc)
    # Convert ObjectId to string
    if "_id" in doc_dict:
        doc_dict["_id"] = str(doc_dict["_id"])
    return doc_dict

# Pydantic models
class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    age: int
    position: str
    squad_number: int
    photo_url: Optional[str] = None
    team_id: str

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age_group: str  # U7, U8, U9, etc.
    logo_url: Optional[str] = None
    players: List[Player] = []

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team_id: str
    away_team_id: str
    date: datetime
    venue: str
    home_formation: str
    away_formation: str
    home_lineup: List[str] = []  # Player IDs
    away_lineup: List[str] = []
    home_substitutes: List[str] = []  # Up to 6 substitutes
    away_substitutes: List[str] = []
    score_home: int = 0
    score_away: int = 0
    status: str = "scheduled"  # scheduled, in_progress, completed

# Formation configurations based on age groups and PFSA standards
FORMATIONS = {
    "11v11": {
        "4-4-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "LM", "x": 20, "y": 45, "label": "LM"},
                {"id": "CM1", "x": 40, "y": 45, "label": "CM"},
                {"id": "CM2", "x": 60, "y": 45, "label": "CM"},
                {"id": "RM", "x": 80, "y": 45, "label": "RM"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"}
            ]
        },
        "4-5-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "LM", "x": 15, "y": 50, "label": "LM"},
                {"id": "CDM", "x": 35, "y": 55, "label": "CDM"},
                {"id": "CM", "x": 50, "y": 45, "label": "CM"},
                {"id": "CAM", "x": 65, "y": 35, "label": "CAM"},
                {"id": "RM", "x": 85, "y": 50, "label": "RM"},
                {"id": "ST", "x": 50, "y": 20, "label": "ST"}
            ]
        },
        "4-3-3": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CM1", "x": 35, "y": 50, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 50, "label": "CM"},
                {"id": "CM3", "x": 65, "y": 50, "label": "CM"},
                {"id": "LW", "x": 25, "y": 25, "label": "LW"},
                {"id": "ST", "x": 50, "y": 20, "label": "ST"},
                {"id": "RW", "x": 75, "y": 25, "label": "RW"}
            ]
        },
        "4-3-2-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CM1", "x": 35, "y": 55, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 55, "label": "CM"},
                {"id": "CM3", "x": 65, "y": 55, "label": "CM"},
                {"id": "CAM1", "x": 40, "y": 35, "label": "CAM"},
                {"id": "CAM2", "x": 60, "y": 35, "label": "CAM"},
                {"id": "ST", "x": 50, "y": 15, "label": "ST"}
            ]
        },
        "4-1-3-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CDM", "x": 50, "y": 60, "label": "CDM"},
                {"id": "LM", "x": 30, "y": 45, "label": "LM"},
                {"id": "CM", "x": 50, "y": 45, "label": "CM"},
                {"id": "RM", "x": 70, "y": 45, "label": "RM"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"}
            ]
        },
        "5-4-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LWB", "x": 15, "y": 70, "label": "LWB"},
                {"id": "CB1", "x": 30, "y": 75, "label": "CB"},
                {"id": "CB2", "x": 50, "y": 80, "label": "SW"},
                {"id": "CB3", "x": 70, "y": 75, "label": "CB"},
                {"id": "RWB", "x": 85, "y": 70, "label": "RWB"},
                {"id": "LM", "x": 25, "y": 50, "label": "LM"},
                {"id": "CM1", "x": 40, "y": 50, "label": "CM"},
                {"id": "CM2", "x": 60, "y": 50, "label": "CM"},
                {"id": "RM", "x": 75, "y": 50, "label": "RM"},
                {"id": "ST", "x": 50, "y": 20, "label": "ST"}
            ]
        },
        "4-1-2-1-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CDM", "x": 50, "y": 60, "label": "CDM"},
                {"id": "CM1", "x": 40, "y": 45, "label": "CM"},
                {"id": "CM2", "x": 60, "y": 45, "label": "CM"},
                {"id": "CAM", "x": 50, "y": 30, "label": "CAM"},
                {"id": "ST1", "x": 40, "y": 15, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 15, "label": "ST"}
            ]
        },
        "3-5-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "CB1", "x": 30, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 50, "y": 70, "label": "CB"},
                {"id": "CB3", "x": 70, "y": 70, "label": "CB"},
                {"id": "LWB", "x": 15, "y": 50, "label": "LWB"},
                {"id": "CM1", "x": 35, "y": 50, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 50, "label": "CM"},
                {"id": "CM3", "x": 65, "y": 50, "label": "CM"},
                {"id": "RWB", "x": 85, "y": 50, "label": "RWB"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"}
            ]
        },
        "5-3-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 35, "y": 75, "label": "CB"},
                {"id": "CB2", "x": 50, "y": 75, "label": "CB"},
                {"id": "CB3", "x": 65, "y": 75, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CM1", "x": 35, "y": 50, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 50, "label": "CM"},
                {"id": "CM3", "x": 65, "y": 50, "label": "CM"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"}
            ]
        },
        "4-2-3-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CDM1", "x": 40, "y": 55, "label": "CDM"},
                {"id": "CDM2", "x": 60, "y": 55, "label": "CDM"},
                {"id": "LW", "x": 25, "y": 35, "label": "LW"},
                {"id": "CAM", "x": 50, "y": 35, "label": "CAM"},
                {"id": "RW", "x": 75, "y": 35, "label": "RW"},
                {"id": "ST", "x": 50, "y": 15, "label": "ST"}
            ]
        },
        "3-2-4-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "CB1", "x": 30, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 50, "y": 70, "label": "CB"},
                {"id": "CB3", "x": 70, "y": 70, "label": "CB"},
                {"id": "CDM1", "x": 40, "y": 55, "label": "CDM"},
                {"id": "CDM2", "x": 60, "y": 55, "label": "CDM"},
                {"id": "LW", "x": 20, "y": 35, "label": "LW"},
                {"id": "LM", "x": 40, "y": 35, "label": "LM"},
                {"id": "RM", "x": 60, "y": 35, "label": "RM"},
                {"id": "RW", "x": 80, "y": 35, "label": "RW"},
                {"id": "ST", "x": 50, "y": 15, "label": "ST"}
            ]
        },
        "4-2-4": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "LB", "x": 20, "y": 70, "label": "LB"},
                {"id": "CB1", "x": 40, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 60, "y": 70, "label": "CB"},
                {"id": "RB", "x": 80, "y": 70, "label": "RB"},
                {"id": "CM1", "x": 40, "y": 50, "label": "CM"},
                {"id": "CM2", "x": 60, "y": 50, "label": "CM"},
                {"id": "LW", "x": 25, "y": 25, "label": "LW"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"},
                {"id": "RW", "x": 75, "y": 25, "label": "RW"}
            ]
        }
    },
    "9v9": {
        "3-3-2": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "CB1", "x": 30, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 50, "y": 70, "label": "CB"},
                {"id": "CB3", "x": 70, "y": 70, "label": "CB"},
                {"id": "CM1", "x": 30, "y": 45, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 45, "label": "CM"},
                {"id": "CM3", "x": 70, "y": 45, "label": "CM"},
                {"id": "ST1", "x": 40, "y": 20, "label": "ST"},
                {"id": "ST2", "x": 60, "y": 20, "label": "ST"}
            ]
        }
    },
    "7v7": {
        "2-3-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "CB1", "x": 35, "y": 70, "label": "CB"},
                {"id": "CB2", "x": 65, "y": 70, "label": "CB"},
                {"id": "CM1", "x": 25, "y": 45, "label": "CM"},
                {"id": "CM2", "x": 50, "y": 45, "label": "CM"},
                {"id": "CM3", "x": 75, "y": 45, "label": "CM"},
                {"id": "ST", "x": 50, "y": 20, "label": "ST"}
            ]
        }
    },
    "5v5": {
        "1-2-1": {
            "positions": [
                {"id": "GK", "x": 50, "y": 90, "label": "GK"},
                {"id": "CB", "x": 50, "y": 70, "label": "CB"},
                {"id": "CM1", "x": 35, "y": 45, "label": "CM"},
                {"id": "CM2", "x": 65, "y": 45, "label": "CM"},
                {"id": "ST", "x": 50, "y": 20, "label": "ST"}
            ]
        }
    }
}

# Age group configurations
AGE_GROUP_CONFIG = {
    "U7": {"format": "5v5", "squad_size": 12, "formations": ["1-2-1"]},
    "U8": {"format": "5v5", "squad_size": 12, "formations": ["1-2-1"]},
    "U9": {"format": "7v7", "squad_size": 15, "formations": ["2-3-1"]},
    "U10": {"format": "7v7", "squad_size": 15, "formations": ["2-3-1"]},
    "U11": {"format": "9v9", "squad_size": 16, "formations": ["3-3-2"]},
    "U12": {"format": "9v9", "squad_size": 16, "formations": ["3-3-2"]},
    "U13": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())},
    "U14": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())},
    "U15": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())},
    "U16": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())},
    "U17": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())},
    "U18": {"format": "11v11", "squad_size": 18, "formations": list(FORMATIONS["11v11"].keys())}
}

# API Routes

@app.get("/api/status")
async def status():
    return {"status": "running", "service": "Grassroots Match Tracker API"}

@app.get("/api/formations/{age_group}")
async def get_formations(age_group: str):
    """Get available formations for an age group"""
    if age_group not in AGE_GROUP_CONFIG:
        raise HTTPException(status_code=404, detail="Age group not found")
    
    config = AGE_GROUP_CONFIG[age_group]
    format_type = config["format"]
    available_formations = {}
    
    for formation_name in config["formations"]:
        if formation_name in FORMATIONS[format_type]:
            available_formations[formation_name] = FORMATIONS[format_type][formation_name]
    
    return {
        "age_group": age_group,
        "format": format_type,
        "formations": available_formations
    }

@app.get("/api/age-groups")
async def get_age_groups():
    """Get all available age groups"""
    return {"age_groups": list(AGE_GROUP_CONFIG.keys())}

@app.post("/api/teams")
async def create_team(team: Team):
    """Create a new team"""
    team_dict = team.dict()
    result = await db.teams.insert_one(team_dict)
    return {"message": "Team created", "team_id": team.id}

@app.get("/api/teams")
async def get_teams():
    """Get all teams"""
    teams = []
    async for team_doc in db.teams.find():
        # Convert to dict and handle ObjectId properly
        team_dict = dict(team_doc)
        # Remove MongoDB's _id field
        if "_id" in team_dict:
            del team_dict["_id"]
        teams.append(team_dict)
    return teams

@app.get("/api/teams/{team_id}")
async def get_team(team_id: str):
    """Get specific team"""
    team_doc = await db.teams.find_one({"id": team_id})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Skip the MongoDB _id field entirely
    team_data = {
        "id": team_doc.get("id"),
        "name": team_doc.get("name"),
        "age_group": team_doc.get("age_group"),
        "logo_url": team_doc.get("logo_url"),
        "players": team_doc.get("players", [])
    }
    return team_data

@app.post("/api/teams/{team_id}/players")
async def add_player(team_id: str, player: Player):
    """Add player to team"""
    player.team_id = team_id
    player_dict = player.dict()
    
    # Add player to database
    await db.players.insert_one(player_dict)
    
    # Update team's player list
    await db.teams.update_one(
        {"id": team_id},
        {"$push": {"players": player_dict}}
    )
    
    return {"message": "Player added", "player_id": player.id}

@app.get("/api/teams/{team_id}/players")
async def get_team_players(team_id: str):
    """Get all players for a team"""
    players = []
    async for player_doc in db.players.find({"team_id": team_id}):
        # Clean player data without MongoDB _id
        player = {
            "id": player_doc.get("id"),
            "first_name": player_doc.get("first_name"),
            "last_name": player_doc.get("last_name"),
            "age": player_doc.get("age"),
            "position": player_doc.get("position"),
            "squad_number": player_doc.get("squad_number"),
            "photo_url": player_doc.get("photo_url"),
            "team_id": player_doc.get("team_id")
        }
        players.append(player)
    return players

@app.post("/api/matches")
async def create_match(match: Match):
    """Create a new match"""
    match_dict = match.dict()
    result = await db.matches.insert_one(match_dict)
    return {"message": "Match created", "match_id": match.id}

@app.get("/api/matches")
async def get_matches():
    """Get all matches"""
    matches = []
    async for match_doc in db.matches.find():
        # Clean match data without MongoDB _id
        match = {
            "id": match_doc.get("id"),
            "home_team_id": match_doc.get("home_team_id"),
            "away_team_id": match_doc.get("away_team_id"),
            "date": match_doc.get("date"),
            "venue": match_doc.get("venue"),
            "home_formation": match_doc.get("home_formation"),
            "away_formation": match_doc.get("away_formation"),
            "home_lineup": match_doc.get("home_lineup", []),
            "away_lineup": match_doc.get("away_lineup", []),
            "home_substitutes": match_doc.get("home_substitutes", []),
            "away_substitutes": match_doc.get("away_substitutes", []),
            "score_home": match_doc.get("score_home", 0),
            "score_away": match_doc.get("score_away", 0),
            "status": match_doc.get("status", "scheduled")
        }
        matches.append(match)
    return matches

@app.get("/api/matches/{match_id}")
async def get_match(match_id: str):
    """Get specific match"""
    match_doc = await db.matches.find_one({"id": match_id})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Clean match data without MongoDB _id
    match = {
        "id": match_doc.get("id"),
        "home_team_id": match_doc.get("home_team_id"),
        "away_team_id": match_doc.get("away_team_id"),
        "date": match_doc.get("date"),
        "venue": match_doc.get("venue"),
        "home_formation": match_doc.get("home_formation"),
        "away_formation": match_doc.get("away_formation"),
        "home_lineup": match_doc.get("home_lineup", []),
        "away_lineup": match_doc.get("away_lineup", []),
        "home_substitutes": match_doc.get("home_substitutes", []),
        "away_substitutes": match_doc.get("away_substitutes", []),
        "score_home": match_doc.get("score_home", 0),
        "score_away": match_doc.get("score_away", 0),
        "status": match_doc.get("status", "scheduled")
    }
    return match

@app.put("/api/matches/{match_id}")
async def update_match(match_id: str, match_data: dict):
    """Update match data"""
    result = await db.matches.update_one(
        {"id": match_id},
        {"$set": match_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"message": "Match updated"}

# WebSocket manager for real-time updates
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

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message text was: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)