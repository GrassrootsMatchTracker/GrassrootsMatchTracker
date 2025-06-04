import requests
import sys
import json
import uuid
from datetime import datetime, timedelta

class GrassrootsMatchTrackerTester:
    def __init__(self, base_url="https://38845ba4-f961-4e64-93c1-21e37eb937ef.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_data = {}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    # API Health and Status Tests
    def test_api_status(self):
        """Test API status endpoint"""
        success, response = self.run_test(
            "API Status Check",
            "GET",
            "api/status",
            200
        )
        if success:
            print(f"API Status: {response}")
        return success

    # Team Management Tests
    def test_get_teams(self):
        """Test getting all teams"""
        success, response = self.run_test(
            "Get All Teams",
            "GET",
            "api/teams",
            200
        )
        if success:
            print(f"Found {len(response)} teams")
        return success

    def test_create_team(self, team_name, age_group):
        """Test creating a new team"""
        team_data = {
            "name": team_name, 
            "age_group": age_group,
            "logo_url": "https://example.com/logo.png"
        }
        
        success, response = self.run_test(
            f"Create Team ({age_group})",
            "POST",
            "api/teams",
            200,
            data=team_data
        )
        if success and 'team_id' in response:
            print(f"Created team with ID: {response['team_id']}")
            return response['team_id']
        return None

    def test_get_team(self, team_id):
        """Test getting a specific team"""
        success, response = self.run_test(
            "Get Team Details",
            "GET",
            f"api/teams/{team_id}",
            200
        )
        if success:
            print(f"Team details: {json.dumps(response, indent=2)}")
        return success

    def test_delete_team(self, team_id):
        """Test deleting a team"""
        success, response = self.run_test(
            "Delete Team",
            "DELETE",
            f"api/teams/{team_id}",
            200
        )
        if success:
            print(f"Team deletion response: {response}")
        return success

    # Player Management Tests
    def test_add_player(self, team_id, player_data):
        """Test adding a player to a team"""
        success, response = self.run_test(
            "Add Player to Team",
            "POST",
            f"api/teams/{team_id}/players",
            200,
            data=player_data
        )
        if success and 'player_id' in response:
            print(f"Added player with ID: {response['player_id']}")
            return response['player_id']
        return None

    def test_get_team_players(self, team_id):
        """Test getting all players for a team"""
        success, response = self.run_test(
            "Get Team Players",
            "GET",
            f"api/teams/{team_id}/players",
            200
        )
        if success:
            print(f"Found {len(response)} players for team {team_id}")
            if len(response) > 0:
                print(f"First player: {json.dumps(response[0], indent=2)}")
        return success, response

    def test_update_player(self, team_id, player_id, update_data):
        """Test updating player information"""
        success, response = self.run_test(
            "Update Player",
            "PUT",
            f"api/teams/{team_id}/players/{player_id}",
            200,
            data=update_data
        )
        if success:
            print(f"Player update response: {response}")
        return success

    def test_delete_player(self, team_id, player_id):
        """Test deleting a player"""
        success, response = self.run_test(
            "Delete Player",
            "DELETE",
            f"api/teams/{team_id}/players/{player_id}",
            200
        )
        if success:
            print(f"Player deletion response: {response}")
        return success

    # Formation System Tests
    def test_get_age_groups(self):
        """Test getting available age groups"""
        success, response = self.run_test(
            "Get Age Groups",
            "GET",
            "api/age-groups",
            200
        )
        if success and 'age_groups' in response:
            print(f"Available age groups: {response['age_groups']}")
            return success, response['age_groups']
        return success, []

    def test_get_formations(self, age_group):
        """Test getting formations for an age group"""
        success, response = self.run_test(
            f"Get Formations for {age_group}",
            "GET",
            f"api/formations/{age_group}",
            200
        )
        if success:
            print(f"Formation data for {age_group}: {json.dumps(response, indent=2)}")
        return success

    # Match Management Tests
    def test_create_match(self, home_team_id, away_team_id):
        """Test creating a match"""
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
        
        success, response = self.run_test(
            "Create Match",
            "POST",
            "api/matches",
            200,
            data=match_data
        )
        if success and 'match_id' in response:
            print(f"Created match with ID: {response['match_id']}")
            return response['match_id']
        return None

    def test_get_matches(self):
        """Test getting all matches"""
        success, response = self.run_test(
            "Get All Matches",
            "GET",
            "api/matches",
            200
        )
        if success:
            print(f"Found {len(response)} matches")
            if len(response) > 0:
                print(f"First match: {json.dumps(response[0], indent=2)}")
        return success

    def test_get_match(self, match_id):
        """Test getting a specific match"""
        success, response = self.run_test(
            "Get Match Details",
            "GET",
            f"api/matches/{match_id}",
            200
        )
        if success:
            print(f"Match details: {json.dumps(response, indent=2)}")
        return success

    def test_update_match(self, match_id):
        """Test updating match information"""
        update_data = {
            "score_home": 2,
            "score_away": 1,
            "status": "completed"
        }
        
        success, response = self.run_test(
            "Update Match",
            "PUT",
            f"api/matches/{match_id}",
            200,
            data=update_data
        )
        if success:
            print(f"Match update response: {response}")
        return success

    # Error Handling Tests
    def test_invalid_endpoint(self):
        """Test accessing an invalid endpoint"""
        success, response = self.run_test(
            "Invalid Endpoint",
            "GET",
            "api/nonexistent",
            404
        )
        # For error tests, we expect a 404, so success means we got the expected error
        return success

    def test_invalid_team_id(self):
        """Test accessing a team with invalid ID"""
        success, response = self.run_test(
            "Invalid Team ID",
            "GET",
            "api/teams/invalid-id-12345",
            404
        )
        return success

    def test_missing_required_fields(self):
        """Test creating a team with missing required fields"""
        success, response = self.run_test(
            "Missing Required Fields",
            "POST",
            "api/teams",
            422,  # FastAPI validation error code
            data={"name": "Incomplete Team"}  # Missing age_group
        )
        return success

def main():
    # Setup
    tester = GrassrootsMatchTrackerTester()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    print("\n" + "=" * 80)
    print("🔍 STARTING COMPREHENSIVE BACKEND API TESTS 🔍")
    print("=" * 80)

    # 1. API Health and Status
    print("\n📋 SECTION 1: API HEALTH AND STATUS")
    if not tester.test_api_status():
        print("❌ API status check failed, stopping tests")
        return 1

    # 2. Team Management
    print("\n📋 SECTION 2: TEAM MANAGEMENT")
    
    # Test creating teams with different age groups
    team_ids = {}
    for age_group in ["U7", "U13", "U18"]:
        team_name = f"Test Team {age_group} {timestamp}"
        team_id = tester.test_create_team(team_name, age_group)
        if not team_id:
            print(f"❌ Failed to create {age_group} team, continuing with other tests")
        else:
            team_ids[age_group] = team_id
    
    if not team_ids:
        print("❌ Failed to create any teams, stopping tests")
        return 1
    
    # Test retrieving all teams
    if not tester.test_get_teams():
        print("❌ Failed to get teams list")
    
    # Test getting specific team details
    for age_group, team_id in team_ids.items():
        if not tester.test_get_team(team_id):
            print(f"❌ Failed to get {age_group} team details")
    
    # 3. Player Management
    print("\n📋 SECTION 3: PLAYER MANAGEMENT")
    
    # Test adding players to teams
    player_ids = {}
    for age_group, team_id in team_ids.items():
        players = []
        for i in range(3):  # Add 3 players to each team
            player_data = {
                "first_name": f"Player{i}",
                "last_name": f"Test{timestamp}",
                "age": 10 if age_group == "U13" else (6 if age_group == "U7" else 16),
                "position": "Forward" if i == 0 else ("Midfielder" if i == 1 else "Defender"),
                "squad_number": i + 1
            }
            player_id = tester.test_add_player(team_id, player_data)
            if player_id:
                players.append(player_id)
        
        if players:
            player_ids[team_id] = players
    
    # Test retrieving team players
    for team_id, players in player_ids.items():
        success, response = tester.test_get_team_players(team_id)
        if not success:
            print(f"❌ Failed to get players for team {team_id}")
    
    # Test updating player information
    for team_id, players in player_ids.items():
        if players:
            update_data = {
                "position": "Goalkeeper",
                "squad_number": 99
            }
            if not tester.test_update_player(team_id, players[0], update_data):
                print(f"❌ Failed to update player {players[0]}")
    
    # Test deleting a player
    for team_id, players in player_ids.items():
        if len(players) > 1:
            if not tester.test_delete_player(team_id, players[-1]):
                print(f"❌ Failed to delete player {players[-1]}")
    
    # 4. Formation System
    print("\n📋 SECTION 4: FORMATION SYSTEM")
    
    # Test getting available age groups
    success, age_groups = tester.test_get_age_groups()
    if not success:
        print("❌ Failed to get age groups")
    
    # Test formation retrieval for different age groups
    for age_group in ["U7", "U13", "U18"]:
        if not tester.test_get_formations(age_group):
            print(f"❌ Failed to get formations for {age_group}")
    
    # 5. Match Management
    print("\n📋 SECTION 5: MATCH MANAGEMENT")
    
    # We need at least two teams to create a match
    if len(team_ids) >= 2:
        team_id_list = list(team_ids.values())
        
        # Test creating a match
        match_id = tester.test_create_match(team_id_list[0], team_id_list[1])
        if not match_id:
            print("❌ Failed to create match")
        else:
            # Test retrieving matches
            if not tester.test_get_matches():
                print("❌ Failed to get matches")
            
            # Test getting specific match
            if not tester.test_get_match(match_id):
                print("❌ Failed to get match details")
            
            # Test updating match information
            if not tester.test_update_match(match_id):
                print("❌ Failed to update match")
    else:
        print("⚠️ Skipping match tests - need at least two teams")
    
    # 6. Error Handling
    print("\n📋 SECTION 6: ERROR HANDLING")
    
    # Test invalid endpoint
    if not tester.test_invalid_endpoint():
        print("❌ Failed invalid endpoint test")
    
    # Test invalid team ID
    if not tester.test_invalid_team_id():
        print("❌ Failed invalid team ID test")
    
    # Test missing required fields
    if not tester.test_missing_required_fields():
        print("❌ Failed missing required fields test")
    
    # 7. Cleanup - Delete teams
    print("\n📋 SECTION 7: CLEANUP")
    for age_group, team_id in team_ids.items():
        if not tester.test_delete_team(team_id):
            print(f"❌ Failed to delete {age_group} team")
    
    # Print results
    print("\n" + "=" * 80)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    print("=" * 80)
    print("🔍 BACKEND API TESTS COMPLETED 🔍\n")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
