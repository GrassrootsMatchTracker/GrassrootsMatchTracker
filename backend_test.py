import requests
import unittest
import json
import os
from datetime import datetime, timedelta

class GrassrootsMatchTrackerAPITest(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8001"  # Default URL
        self.api_url = f"{self.base_url}/api"
        
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = requests.get(self.base_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Grassroots Match Tracker API")
        self.assertEqual(data["version"], "1.0.0")
        
    def test_get_teams(self):
        """Test getting all teams"""
        response = requests.get(f"{self.api_url}/teams")
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        print(f"Found {len(teams)} teams")
        
    def test_get_formations(self):
        """Test getting all formations"""
        response = requests.get(f"{self.api_url}/formations")
        self.assertEqual(response.status_code, 200)
        formations = response.json()
        self.assertIsInstance(formations, dict)
        print(f"Found {len(formations)} formations: {', '.join(formations.keys())}")
        
    def test_create_and_get_team(self):
        """Test creating a team and then retrieving it"""
        # Create a team
        team_data = {
            "name": f"Test Team {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "primary_color": "#000000",
            "secondary_color": "#ffffff",
            "founded_year": 2025,
            "description": "Test team created by automated test"
        }
        
        response = requests.post(f"{self.api_url}/teams", json=team_data)
        self.assertEqual(response.status_code, 200)
        created_team = response.json()
        self.assertEqual(created_team["name"], team_data["name"])
        team_id = created_team["id"]
        
        # Get the team by ID
        response = requests.get(f"{self.api_url}/teams/{team_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_team = response.json()
        self.assertEqual(retrieved_team["id"], team_id)
        self.assertEqual(retrieved_team["name"], team_data["name"])
        
    def test_create_player_and_get_team_players(self):
        """Test creating a player and retrieving players for a team"""
        # First, get a team or create one
        response = requests.get(f"{self.api_url}/teams")
        teams = response.json()
        
        if not teams:
            # Create a team if none exists
            team_data = {
                "name": f"Player Test Team {datetime.now().strftime('%Y%m%d%H%M%S')}",
                "primary_color": "#000000",
                "secondary_color": "#ffffff"
            }
            response = requests.post(f"{self.api_url}/teams", json=team_data)
            team = response.json()
            team_id = team["id"]
        else:
            team_id = teams[0]["id"]
            
        # Create a player
        player_data = {
            "team_id": team_id,
            "name": f"Test Player {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "squad_number": 99,
            "position": "MID",
            "age": 25,
            "nationality": "Test Nation"
        }
        
        response = requests.post(f"{self.api_url}/players", json=player_data)
        self.assertEqual(response.status_code, 200)
        created_player = response.json()
        self.assertEqual(created_player["name"], player_data["name"])
        
        # Get players for the team
        response = requests.get(f"{self.api_url}/teams/{team_id}/players")
        self.assertEqual(response.status_code, 200)
        players = response.json()
        self.assertIsInstance(players, list)
        
        # Verify our player is in the list
        player_found = False
        for player in players:
            if player["id"] == created_player["id"]:
                player_found = True
                break
                
        self.assertTrue(player_found, "Created player not found in team players list")
        print(f"Found {len(players)} players for team {team_id}")
        
    def test_create_match(self):
        """Test creating a match"""
        # First, get or create two teams
        response = requests.get(f"{self.api_url}/teams")
        teams = response.json()
        
        if len(teams) < 2:
            # Create teams if we don't have at least 2
            for i in range(2 - len(teams)):
                team_data = {
                    "name": f"Match Test Team {i} {datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "primary_color": "#000000",
                    "secondary_color": "#ffffff"
                }
                response = requests.post(f"{self.api_url}/teams", json=team_data)
                teams.append(response.json())
        
        # Create a match
        match_date = (datetime.now() + timedelta(days=7)).isoformat()
        match_data = {
            "home_team_id": teams[0]["id"],
            "away_team_id": teams[1]["id"],
            "match_type": "Friendly",
            "match_date": match_date,
            "venue": "Test Stadium",
            "home_formation": "4-4-2",
            "away_formation": "4-3-3",
            "home_lineup": [],
            "away_lineup": [],
            "home_substitutes": [],
            "away_substitutes": []
        }
        
        response = requests.post(f"{self.api_url}/matches", json=match_data)
        self.assertEqual(response.status_code, 200)
        created_match = response.json()
        self.assertEqual(created_match["home_team_id"], match_data["home_team_id"])
        self.assertEqual(created_match["away_team_id"], match_data["away_team_id"])
        
        # Get all matches
        response = requests.get(f"{self.api_url}/matches")
        self.assertEqual(response.status_code, 200)
        matches = response.json()
        self.assertIsInstance(matches, list)
        print(f"Found {len(matches)} matches")

if __name__ == "__main__":
    unittest.main()