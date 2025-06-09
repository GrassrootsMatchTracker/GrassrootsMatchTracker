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

# Helper function to convert MongoDB documents
def clean_mongo_doc(doc):
    """Convert MongoDB document to clean dict without ObjectId"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [clean_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        clean_doc = {}
        for key, value in doc.items():
            if key == "_id":
                continue  # Skip MongoDB's _id field
            elif isinstance(value, ObjectId):
                clean_doc[key] = str(value)
            elif isinstance(value, dict):
                clean_doc[key] = clean_mongo_doc(value)
            elif isinstance(value, list):
                clean_doc[key] = clean_mongo_doc(value)
            else:
                clean_doc[key] = value
        return clean_doc
    return doc

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
class PlayerStats(BaseModel):
    appearances: int = 0
    goals: int = 0
    assists: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    minutes_played: int = 0

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    age: int
    position: str
    squad_number: int
    photo_base64: Optional[str] = None  # Changed to base64 storage
    team_id: Optional[str] = None  # Made optional since it's set from URL parameter
    stats: PlayerStats = Field(default_factory=PlayerStats)

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age_group: str  # U7, U8, U9, etc.
    logo_url: Optional[str] = None
    players: List[Player] = []

class MatchEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    player_id: str
    event_type: str  # "goal", "assist", "yellow_card", "red_card", "substitution"
    minute: int
    timestamp: datetime = Field(default_factory=datetime.now)
    additional_data: Optional[Dict[str, Any]] = {}

class LiveMatchState(BaseModel):
    match_id: str
    is_active: bool = False
    current_minute: int = 0
    timer_started_at: Optional[datetime] = None
    events: List[MatchEvent] = []

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    opposition_name: Optional[str] = None  # For when one team is external
    date: datetime
    venue: str
    home_formation: str
    away_formation: str = "4-4-2"
    match_format: str = "11v11"  # 5v5, 6v6, 7v7, 8v8, 9v9, 10v10, 11v11
    match_type: str = "Friendly"  # League, Friendly, Cup
    home_lineup: List[str] = []  # Player IDs
    away_lineup: List[str] = []
    home_substitutes: List[str] = []  # Up to 5 substitutes
    away_substitutes: List[str] = []
    home_positions: Dict[str, str] = {}  # position_id -> player_id mapping
    away_positions: Dict[str, str] = {}
    score_home: int = 0
    score_away: int = 0
    status: str = "scheduled"  # scheduled, live, completed
    events: List[MatchEvent] = []

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
        clean_team = clean_mongo_doc(team_doc)
        teams.append(clean_team)
    return teams

@app.get("/api/teams/{team_id}")
async def get_team(team_id: str):
    """Get specific team"""
    team_doc = await db.teams.find_one({"id": team_id})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get all players for this team
    players = []
    async for player_doc in db.players.find({"team_id": team_id}):
        clean_player = clean_mongo_doc(player_doc)
        players.append(clean_player)
    
    # Build clean team data
    team_data = {
        "id": team_doc.get("id"),
        "name": team_doc.get("name"),
        "age_group": team_doc.get("age_group"),
        "logo_url": team_doc.get("logo_url"),
        "players": players
    }
    return team_data

@app.post("/api/teams/{team_id}/players")
async def add_player(team_id: str, player: Player):
    """Add player to team"""
    # Set the team_id from the URL parameter
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

@app.delete("/api/teams/{team_id}")
async def delete_team(team_id: str):
    """Delete a team and all its players"""
    # Delete all players for this team
    await db.players.delete_many({"team_id": team_id})
    
    # Delete the team
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return {"message": "Team deleted successfully"}

@app.delete("/api/teams/{team_id}/players/{player_id}")
async def delete_player(team_id: str, player_id: str):
    """Delete a player from a team"""
    # Delete player from database
    result = await db.players.delete_one({"id": player_id, "team_id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Remove player from team's player list
    await db.teams.update_one(
        {"id": team_id},
        {"$pull": {"players": {"id": player_id}}}
    )
    
    return {"message": "Player deleted successfully"}

@app.put("/api/teams/{team_id}/players/{player_id}")
async def update_player(team_id: str, player_id: str, player_data: dict):
    """Update player information"""
    # Update player in database
    result = await db.players.update_one(
        {"id": player_id, "team_id": team_id},
        {"$set": player_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Update player in team's player list
    await db.teams.update_one(
        {"id": team_id, "players.id": player_id},
        {"$set": {"players.$": {**player_data, "id": player_id, "team_id": team_id}}}
    )
    
    return {"message": "Player updated successfully"}

@app.get("/api/teams/{team_id}/players")
async def get_team_players(team_id: str):
    """Get all players for a team"""
    players = []
    async for player_doc in db.players.find({"team_id": team_id}):
        clean_player = clean_mongo_doc(player_doc)
        players.append(clean_player)
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
        clean_match = clean_mongo_doc(match_doc)
        matches.append(clean_match)
    return matches

@app.get("/api/matches/{match_id}")
async def get_match(match_id: str):
    """Get specific match"""
    match_doc = await db.matches.find_one({"id": match_id})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    
    clean_match = clean_mongo_doc(match_doc)
    return clean_match

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

@app.post("/api/matches/{match_id}/start")
async def start_match(match_id: str):
    """Start a live match"""
    match_doc = await db.matches.find_one({"id": match_id})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Update match status to live
    await db.matches.update_one(
        {"id": match_id},
        {"$set": {
            "status": "live",
            "timer_started_at": datetime.now().isoformat()
        }}
    )
    
    return {"message": "Match started", "match_id": match_id}

@app.post("/api/matches/{match_id}/events")
async def add_match_event(match_id: str, event: MatchEvent):
    """Add an event to a live match"""
    event_dict = event.dict()
    
    # Add event to events collection
    await db.match_events.insert_one(event_dict)
    
    # Update match with the event
    await db.matches.update_one(
        {"id": match_id},
        {"$push": {"events": event_dict}}
    )
    
    # Update player statistics
    if event.event_type == "goal":
        await db.players.update_one(
            {"id": event.player_id},
            {"$inc": {"stats.goals": 1}}
        )
        
        # Get the match to determine which team scored
        match_doc = await db.matches.find_one({"id": match_id})
        if match_doc:
            # Get the player to determine which team they belong to
            player_doc = await db.players.find_one({"id": event.player_id})
            if player_doc and player_doc.get("team_id"):
                player_team_id = player_doc.get("team_id")
                
                # Update the appropriate team's score
                if player_team_id == match_doc.get("home_team_id"):
                    await db.matches.update_one(
                        {"id": match_id},
                        {"$inc": {"score_home": 1}}
                    )
                elif player_team_id == match_doc.get("away_team_id"):
                    await db.matches.update_one(
                        {"id": match_id},
                        {"$inc": {"score_away": 1}}
                    )
    elif event.event_type == "assist":
        await db.players.update_one(
            {"id": event.player_id},
            {"$inc": {"stats.assists": 1}}
        )
    elif event.event_type == "yellow_card":
        await db.players.update_one(
            {"id": event.player_id},
            {"$inc": {"stats.yellow_cards": 1}}
        )
    elif event.event_type == "red_card":
        await db.players.update_one(
            {"id": event.player_id},
            {"$inc": {"stats.red_cards": 1}}
        )
    
    return {"message": "Event added", "event_id": event.id}

@app.get("/api/matches/{match_id}/live")
async def get_live_match_state(match_id: str):
    """Get live match state"""
    match_doc = await db.matches.find_one({"id": match_id})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    
    clean_match = clean_mongo_doc(match_doc)
    return clean_match

@app.delete("/api/matches/{match_id}")
async def delete_match(match_id: str):
    """Delete a match"""
    result = await db.matches.delete_one({"id": match_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Also delete any events for this match
    await db.match_events.delete_many({"match_id": match_id})
    
    return {"message": "Match deleted successfully"}

@app.get("/api/teams/{team_id}/statistics")
async def get_team_statistics(team_id: str):
    """Get detailed team statistics including player stats"""
    team_doc = await db.teams.find_one({"id": team_id})
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get all players with their statistics
    players = []
    async for player_doc in db.players.find({"team_id": team_id}):
        clean_player = clean_mongo_doc(player_doc)
        players.append(clean_player)
    
    # Get team's match statistics
    team_matches = []
    async for match_doc in db.matches.find({
        "$or": [
            {"home_team_id": team_id},
            {"away_team_id": team_id}
        ]
    }):
        clean_match = clean_mongo_doc(match_doc)
        team_matches.append(clean_match)
    
    # Calculate team statistics
    matches_played = len([m for m in team_matches if m.get("status") == "completed"])
    matches_won = 0
    goals_for = 0
    goals_against = 0
    
    for match in team_matches:
        if match.get("status") == "completed":
            if match.get("home_team_id") == team_id:
                goals_for += match.get("score_home", 0)
                goals_against += match.get("score_away", 0)
                if match.get("score_home", 0) > match.get("score_away", 0):
                    matches_won += 1
            else:
                goals_for += match.get("score_away", 0)
                goals_against += match.get("score_home", 0)
                if match.get("score_away", 0) > match.get("score_home", 0):
                    matches_won += 1
    
    return {
        "team": clean_mongo_doc(team_doc),
        "players": players,
        "statistics": {
            "matches_played": matches_played,
            "matches_won": matches_won,
            "goals_for": goals_for,
            "goals_against": goals_against,
            "win_percentage": (matches_won / matches_played * 100) if matches_played > 0 else 0
        }
    }

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