import requests
import unittest
import json
import os
from datetime import datetime, timedelta

class GrassrootsMatchTrackerAPITest(unittest.TestCase):
    def setUp(self):
        # Use the public endpoint for testing
        self.base_url = "https://cd383368-5be3-438a-8b06-4a1311095d02.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        print(f"Testing API at: {self.api_url}")
        
    def test_status_endpoint(self):
        """Test the status endpoint"""
        response = requests.get(f"{self.api_url}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "running")
        self.assertEqual(data["service"], "Grassroots Match Tracker API")
        print("✅ Status endpoint working correctly")
        
    def test_get_age_groups(self):
        """Test getting all age groups"""
        response = requests.get(f"{self.api_url}/age-groups")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("age_groups", data)
        age_groups = data["age_groups"]
        self.assertIsInstance(age_groups, list)
        
        # Verify all required age groups are available
        required_age_groups = ["U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18"]
        for age_group in required_age_groups:
            self.assertIn(age_group, age_groups, f"Age group {age_group} is missing")
            
        print(f"✅ Found {len(age_groups)} age groups: {', '.join(age_groups)}")
        return age_groups
        
    def test_get_formations_by_age_group(self):
        """Test getting formations for each age group"""
        age_groups = self.test_get_age_groups()
        
        for age_group in age_groups:
            response = requests.get(f"{self.api_url}/formations/{age_group}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            self.assertIn("age_group", data)
            self.assertEqual(data["age_group"], age_group)
            self.assertIn("format", data)
            self.assertIn("formations", data)
            
            formations = data["formations"]
            self.assertIsInstance(formations, dict)
            
            # Check format matches age group
            if age_group in ["U7", "U8"]:
                self.assertEqual(data["format"], "5v5")
            elif age_group in ["U9", "U10"]:
                self.assertEqual(data["format"], "7v7")
            elif age_group in ["U11", "U12"]:
                self.assertEqual(data["format"], "9v9")
            else:
                self.assertEqual(data["format"], "11v11")
                
            # Check formations structure
            for name, formation in formations.items():
                self.assertIn("positions", formation)
                positions = formation["positions"]
                self.assertIsInstance(positions, list)
                
                # Check positions have required fields
                for position in positions:
                    self.assertIn("id", position)
                    self.assertIn("x", position)
                    self.assertIn("y", position)
                    self.assertIn("label", position)
                    
            print(f"✅ Age group {age_group} has format {data['format']} with {len(formations)} formations")
            
    def test_get_teams(self):
        """Test getting all teams"""
        response = requests.get(f"{self.api_url}/teams")
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertIsInstance(teams, list)
        print(f"✅ Found {len(teams)} teams")
        return teams
        
    def test_create_and_get_team(self):
        """Test creating a team and then retrieving it"""
        # Create a team with age group
        team_name = f"Test Team {datetime.now().strftime('%Y%m%d%H%M%S')}"
        team_data = {
            "name": team_name,
            "age_group": "U13",
            "logo_url": None
        }
        
        response = requests.post(f"{self.api_url}/teams", json=team_data)
        self.assertEqual(response.status_code, 200)
        created_team = response.json()
        self.assertIn("message", created_team)
        self.assertIn("team_id", created_team)
        team_id = created_team["team_id"]
        
        # Get the team by ID
        response = requests.get(f"{self.api_url}/teams/{team_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_team = response.json()
        self.assertEqual(retrieved_team["id"], team_id)
        self.assertEqual(retrieved_team["name"], team_data["name"])
        self.assertEqual(retrieved_team["age_group"], team_data["age_group"])
        
        print(f"✅ Team created and retrieved successfully: {team_data['name']} ({team_data['age_group']})")
        return retrieved_team
        
    def test_create_player_with_first_last_name(self):
        """Test creating a player with first and last name fields"""
        # First, get a team or create one
        teams = self.test_get_teams()
        
        if not teams:
            team = self.test_create_and_get_team()
            team_id = team["id"]
        else:
            team_id = teams[0]["id"]
            
        # Create a player with first and last name
        first_name = f"First{datetime.now().strftime('%H%M%S')}"
        last_name = f"Last{datetime.now().strftime('%H%M%S')}"
        
        player_data = {
            "first_name": first_name,
            "last_name": last_name,
            "age": 16,
            "position": "MID",
            "squad_number": 99,
            "photo_url": None,
            "team_id": team_id
        }
        
        response = requests.post(f"{self.api_url}/teams/{team_id}/players", json=player_data)
        self.assertEqual(response.status_code, 200)
        created_player = response.json()
        self.assertIn("message", created_player)
        self.assertIn("player_id", created_player)
        player_id = created_player["player_id"]
        
        # Get players for the team
        response = requests.get(f"{self.api_url}/teams/{team_id}/players")
        self.assertEqual(response.status_code, 200)
        players = response.json()
        self.assertIsInstance(players, list)
        
        # Verify our player is in the list
        player_found = False
        for player in players:
            if player["id"] == player_id:
                player_found = True
                # Verify the player has the expected fields
                self.assertEqual(player["first_name"], first_name)
                self.assertEqual(player["last_name"], last_name)
                self.assertEqual(player["squad_number"], 99)
                self.assertEqual(player["position"], "MID")
                self.assertEqual(player["age"], 16)
                break
                
        self.assertTrue(player_found, "Created player not found in team players list")
        print(f"✅ Created player with first/last name and found in team's player list: {first_name} {last_name}")
        return player_id
        
    def test_create_match(self):
        """Test creating a match with squad selection"""
        # Get or create two teams
        teams = self.test_get_teams()
        
        if len(teams) < 2:
            # Create teams if we don't have at least 2
            team1 = self.test_create_and_get_team()
            team_data = {
                "name": f"Away Team {datetime.now().strftime('%Y%m%d%H%M%S')}",
                "age_group": "U13",
                "logo_url": None
            }
            response = requests.post(f"{self.api_url}/teams", json=team_data)
            team2_id = response.json()["team_id"]
            home_team_id = team1["id"]
            away_team_id = team2_id
        else:
            home_team_id = teams[0]["id"]
            away_team_id = teams[1]["id"]
        
        # Create a match
        match_date = (datetime.now() + timedelta(days=7)).isoformat()
        match_data = {
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "date": match_date,
            "venue": "Test Stadium",
            "home_formation": "4-4-2",
            "away_formation": "4-3-3",
            "home_lineup": [],
            "away_lineup": [],
            "home_substitutes": [],
            "away_substitutes": [],
            "score_home": 0,
            "score_away": 0,
            "status": "scheduled"
        }
        
        response = requests.post(f"{self.api_url}/matches", json=match_data)
        self.assertEqual(response.status_code, 200)
        created_match = response.json()
        self.assertIn("message", created_match)
        self.assertIn("match_id", created_match)
        match_id = created_match["match_id"]
        
        # Get the match by ID
        response = requests.get(f"{self.api_url}/matches/{match_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_match = response.json()
        self.assertEqual(retrieved_match["id"], match_id)
        self.assertEqual(retrieved_match["home_team_id"], home_team_id)
        self.assertEqual(retrieved_match["away_team_id"], away_team_id)
        self.assertEqual(retrieved_match["venue"], "Test Stadium")
        self.assertEqual(retrieved_match["home_formation"], "4-4-2")
        self.assertEqual(retrieved_match["away_formation"], "4-3-3")
        
        print(f"✅ Match created and retrieved successfully")
        return match_id
        
    def test_update_match(self):
        """Test updating a match"""
        match_id = self.test_create_match()
        
        # Update match data
        update_data = {
            "venue": "Updated Stadium",
            "status": "in_progress",
            "score_home": 2,
            "score_away": 1
        }
        
        response = requests.put(f"{self.api_url}/matches/{match_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        update_response = response.json()
        self.assertIn("message", update_response)
        
        # Get the match to verify updates
        response = requests.get(f"{self.api_url}/matches/{match_id}")
        self.assertEqual(response.status_code, 200)
        updated_match = response.json()
        self.assertEqual(updated_match["venue"], "Updated Stadium")
        self.assertEqual(updated_match["status"], "in_progress")
        self.assertEqual(updated_match["score_home"], 2)
        self.assertEqual(updated_match["score_away"], 1)
        
        print(f"✅ Match updated successfully")

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in specific order
    suite.addTest(GrassrootsMatchTrackerAPITest('test_status_endpoint'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_age_groups'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_formations_by_age_group'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_get_teams'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_and_get_team'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_player_with_first_last_name'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_create_match'))
    suite.addTest(GrassrootsMatchTrackerAPITest('test_update_match'))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=3)
    result = runner.run(suite)
    
    # Print summary
    print(f"\nTest Summary:")
    print(f"  Ran {result.testsRun} tests")
    print(f"  Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  Failures: {len(result.failures)}")
    print(f"  Errors: {len(result.errors)}")
    
    return result

if __name__ == "__main__":
    print("\n🔍 STARTING BACKEND API TESTS 🔍")
    print("=" * 50)
    run_tests()
    print("=" * 50)
    print("🔍 BACKEND API TESTS COMPLETED 🔍\n")
