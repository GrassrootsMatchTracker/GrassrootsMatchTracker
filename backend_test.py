import requests
import unittest
import json
import os
from datetime import datetime, timedelta

class GrassrootsMatchTrackerAPITest(unittest.TestCase):
    def setUp(self):
        # Use the public endpoint from frontend/.env
        self.base_url = "https://cd383368-5be3-438a-8b06-4a1311095d02.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        print(f"Testing API at: {self.api_url}")
        
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = requests.get(self.base_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Grassroots Match Tracker API")
        self.assertEqual(data["version"], "1.0.0")
        print("✅ Root endpoint working correctly")
        
    def test_get_teams(self):
        """Test getting all teams"""
        response = requests.get(f"{self.api_url}/teams")
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        print(f"✅ Found {len(teams)} teams")
        return teams
        
    def test_get_formations(self):
        """Test getting all formations"""
        response = requests.get(f"{self.api_url}/formations")
        self.assertEqual(response.status_code, 200)
        formations = response.json()
        self.assertIsInstance(formations, dict)
        print(f"✅ Found {len(formations)} formations: {', '.join(formations.keys())}")
        
        # Verify all 5 required formations are available
        required_formations = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2"]
        for formation in required_formations:
            self.assertIn(formation, formations, f"Formation {formation} is missing")
            
        # Verify formation structure
        for name, formation in formations.items():
            self.assertIn("name", formation, f"Formation {name} missing 'name' field")
            self.assertIn("positions", formation, f"Formation {name} missing 'positions' field")
            self.assertIsInstance(formation["positions"], list, f"Formation {name} positions should be a list")
            
            # Check positions have required fields
            for position in formation["positions"]:
                self.assertIn("role", position, f"Position in {name} missing 'role' field")
                self.assertIn("x", position, f"Position in {name} missing 'x' coordinate")
                self.assertIn("y", position, f"Position in {name} missing 'y' coordinate")
                
        print("✅ All formations validated successfully")
        return formations
        
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
        
        print(f"✅ Team created and retrieved successfully: {team_data['name']}")
        return created_team
        
    def test_create_player_with_first_last_name(self):
        """Test creating a player with first and last name fields"""
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
            
        # Create a player with first and last name
        first_name = f"First{datetime.now().strftime('%H%M%S')}"
        last_name = f"Last{datetime.now().strftime('%H%M%S')}"
        
        player_data = {
            "team_id": team_id,
            "name": f"{first_name} {last_name}",  # Combined name for API
            "squad_number": 99,
            "position": "MID",
            "age": 25
            # Note: Height, Weight, Nationality fields removed as per requirements
        }
        
        response = requests.post(f"{self.api_url}/players", json=player_data)
        self.assertEqual(response.status_code, 200)
        created_player = response.json()
        self.assertEqual(created_player["name"], player_data["name"])
        self.assertEqual(created_player["age"], player_data["age"])
        
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
                # Verify the player has the expected fields
                self.assertEqual(player["name"], f"{first_name} {last_name}")
                self.assertEqual(player["squad_number"], 99)
                self.assertEqual(player["position"], "MID")
                self.assertEqual(player["age"], 25)
                # Verify removed fields are not present or are None
                self.assertIsNone(player.get("height"))
                self.assertIsNone(player.get("weight"))
                self.assertIsNone(player.get("nationality"))
                break
                
        self.assertTrue(player_found, "Created player not found in team players list")
        print(f"✅ Created player with first/last name and found in team's player list: {created_player['name']}")
        return created_player
        
    def test_create_match_with_squad_selection(self):
        """Test creating a match with squad selection"""
        # Get formations
        response = requests.get(f"{self.api_url}/formations")
        formations = response.json()
        
        # Get or create two teams
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
        
        # Create 11 players for the home team if needed
        home_team_id = teams[0]["id"]
        response = requests.get(f"{self.api_url}/teams/{home_team_id}/players")
        home_players = response.json()
        
        if len(home_players) < 11:
            # Create additional players
            for i in range(11 - len(home_players)):
                player_data = {
                    "team_id": home_team_id,
                    "name": f"Test Player {i} {datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "squad_number": i + 1,
                    "position": "MID",
                    "age": 25
                }
                response = requests.post(f"{self.api_url}/players", json=player_data)
                home_players.append(response.json())
        
        # Test each formation
        for formation_name in list(formations.keys()):
            # Create a match with this formation
            match_date = (datetime.now() + timedelta(days=7)).isoformat()
            match_data = {
                "home_team_id": teams[0]["id"],
                "away_team_id": teams[1]["id"],
                "match_type": "Friendly",
                "match_date": match_date,
                "venue": f"Test Stadium - {formation_name}",
                "home_formation": formation_name,
                "away_formation": "4-4-2",  # Default away formation
                "home_lineup": [player["id"] for player in home_players[:11]],  # Select 11 players
                "away_lineup": [],
                "home_substitutes": [],
                "away_substitutes": []
            }
            
            response = requests.post(f"{self.api_url}/matches", json=match_data)
            self.assertEqual(response.status_code, 200)
            created_match = response.json()
            self.assertEqual(created_match["home_formation"], formation_name)
            self.assertEqual(len(created_match["home_lineup"]), 11)
            
            print(f"✅ Created match with formation {formation_name} and 11 selected players")
            
            # Get the match by ID to verify
            match_id = created_match["id"]
            response = requests.get(f"{self.api_url}/matches/{match_id}")
            self.assertEqual(response.status_code, 200)
            retrieved_match = response.json()
            self.assertEqual(retrieved_match["id"], match_id)
            self.assertEqual(retrieved_match["home_formation"], formation_name)
            self.assertEqual(len(retrieved_match["home_lineup"]), 11)
            
            # Only test one formation to avoid creating too many matches
            break
        
    def test_match_types(self):
        """Test creating matches with different match types"""
        # Get or create two teams
        response = requests.get(f"{self.api_url}/teams")
        teams = response.json()
        
        if len(teams) < 2:
            # Create teams if we don't have at least 2
            for i in range(2 - len(teams)):
                team_data = {
                    "name": f"Match Type Test Team {i} {datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "primary_color": "#000000",
                    "secondary_color": "#ffffff"
                }
                response = requests.post(f"{self.api_url}/teams", json=team_data)
                teams.append(response.json())
        
        # Test each match type
        match_types = ["Friendly", "League", "Cup"]
        for match_type in match_types:
            match_date = (datetime.now() + timedelta(days=7)).isoformat()
            match_data = {
                "home_team_id": teams[0]["id"],
                "away_team_id": teams[1]["id"],
                "match_type": match_type,
                "match_date": match_date,
                "venue": f"Test Stadium - {match_type} Match",
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
            self.assertEqual(created_match["match_type"], match_type)
            
            print(f"✅ Created {match_type} match successfully")
            
    def test_get_specific_formation(self):
        """Test getting a specific formation"""
        formations = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2"]
        
        for formation_name in formations:
            response = requests.get(f"{self.api_url}/formations/{formation_name}")
            self.assertEqual(response.status_code, 200)
            formation = response.json()
            self.assertEqual(formation["name"], formation_name)
            self.assertIsInstance(formation["positions"], list)
            print(f"✅ Retrieved formation {formation_name} with {len(formation['positions'])} positions")

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in specific order
    suite.addTest(GrassrootsMatchTrackerAPITest('test_root_endpoint'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_teams'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_formations'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_specific_formation'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_and_get_team'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_player_with_first_last_name'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_match_with_squad_selection'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_match_types'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == "__main__":
    run_tests()