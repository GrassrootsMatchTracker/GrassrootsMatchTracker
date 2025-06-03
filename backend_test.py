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
        print(f"✅ Created player and found in team's player list: {created_player['name']}")
        return created_player
        
    def test_create_match_with_all_formations(self):
        """Test creating matches with all available formations"""
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
        
        # Test each formation
        for home_formation in formations.keys():
            for away_formation in list(formations.keys())[:1]:  # Just test one away formation per home formation
                # Create a match with this formation combination
                match_date = (datetime.now() + timedelta(days=7)).isoformat()
                match_data = {
                    "home_team_id": teams[0]["id"],
                    "away_team_id": teams[1]["id"],
                    "match_type": "Friendly",
                    "match_date": match_date,
                    "venue": f"Test Stadium - {home_formation} vs {away_formation}",
                    "home_formation": home_formation,
                    "away_formation": away_formation,
                    "home_lineup": [],
                    "away_lineup": [],
                    "home_substitutes": [],
                    "away_substitutes": []
                }
                
                response = requests.post(f"{self.api_url}/matches", json=match_data)
                self.assertEqual(response.status_code, 200)
                created_match = response.json()
                self.assertEqual(created_match["home_formation"], home_formation)
                self.assertEqual(created_match["away_formation"], away_formation)
                
                print(f"✅ Created match with formations: {home_formation} vs {away_formation}")
        
        # Get all matches
        response = requests.get(f"{self.api_url}/matches")
        self.assertEqual(response.status_code, 200)
        matches = response.json()
        self.assertIsInstance(matches, list)
        print(f"✅ Found {len(matches)} total matches")
        
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
            
    def test_invalid_formation(self):
        """Test requesting an invalid formation"""
        response = requests.get(f"{self.api_url}/formations/invalid-formation")
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid formation request correctly returns 404")

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in specific order
    suite.addTest(GrassrootsMatchTrackerAPITest('test_root_endpoint'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_teams'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_formations'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_specific_formation'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_invalid_formation'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_and_get_team'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_player_and_get_team_players'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_match_types'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_match_with_all_formations'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == "__main__":
    run_tests()