import requests
import sys
import json
import uuid
from datetime import datetime, timedelta

class GrassrootsMatchTrackerTester:
    def __init__(self, base_url="https://b6dbc3a7-e80c-4140-9b06-8fd7858fdaef.preview.emergentagent.com"):
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
        
    def test_add_player_with_photo(self, team_id, player_data, photo_base64):
        """Test adding a player with photo to a team"""
        player_data["photo_base64"] = photo_base64
        success, response = self.run_test(
            "Add Player with Photo to Team",
            "POST",
            f"api/teams/{team_id}/players",
            200,
            data=player_data
        )
        if success and 'player_id' in response:
            print(f"Added player with photo, ID: {response['player_id']}")
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
        
    def test_get_team_statistics(self, team_id):
        """Test getting team statistics"""
        success, response = self.run_test(
            "Get Team Statistics",
            "GET",
            f"api/teams/{team_id}/statistics",
            200
        )
        if success:
            print(f"Team statistics: {json.dumps(response, indent=2)}")
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
        
    def test_create_match_with_lineups(self, home_team_id, away_team_id, home_players, away_players):
        """Test creating a match with lineups and positions"""
        match_date = (datetime.now() + timedelta(days=7)).isoformat()
        
        # Select players for lineup and substitutes
        home_lineup = home_players[:7] if len(home_players) >= 7 else home_players
        home_subs = home_players[7:] if len(home_players) > 7 else []
        
        away_lineup = away_players[:7] if len(away_players) >= 7 else away_players
        away_subs = away_players[7:] if len(away_players) > 7 else []
        
        # Create position mappings (simplified for test)
        home_positions = {}
        away_positions = {}
        
        positions = ["GK", "CB1", "CB2", "CM1", "CM2", "ST1", "ST2"]
        for i, player_id in enumerate(home_lineup):
            if i < len(positions):
                home_positions[positions[i]] = player_id
                
        for i, player_id in enumerate(away_lineup):
            if i < len(positions):
                away_positions[positions[i]] = player_id
        
        match_data = {
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "date": match_date,
            "venue": "Test Stadium",
            "home_formation": "4-4-2",
            "away_formation": "4-3-3",
            "home_lineup": home_lineup,
            "away_lineup": away_lineup,
            "home_substitutes": home_subs,
            "away_substitutes": away_subs,
            "home_positions": home_positions,
            "away_positions": away_positions,
            "score_home": 0,
            "score_away": 0,
            "status": "scheduled"
        }
        
        success, response = self.run_test(
            "Create Match with Lineups",
            "POST",
            "api/matches",
            200,
            data=match_data
        )
        if success and 'match_id' in response:
            print(f"Created match with lineups, ID: {response['match_id']}")
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
        
    def test_start_match(self, match_id):
        """Test starting a match"""
        success, response = self.run_test(
            "Start Match",
            "POST",
            f"api/matches/{match_id}/start",
            200,
            data={}
        )
        if success:
            print(f"Match start response: {response}")
        return success
        
    def test_add_match_event(self, match_id, player_id, event_type, minute=10):
        """Test adding an event to a match"""
        event_data = {
            "match_id": match_id,
            "player_id": player_id,
            "event_type": event_type,
            "minute": minute,
            "additional_data": {}
        }
        
        success, response = self.run_test(
            f"Add Match Event ({event_type})",
            "POST",
            f"api/matches/{match_id}/events",
            200,
            data=event_data
        )
        if success and 'event_id' in response:
            print(f"Added {event_type} event, ID: {response['event_id']}")
            return response['event_id']
        return None
        
    def test_get_live_match_state(self, match_id):
        """Test getting live match state"""
        success, response = self.run_test(
            "Get Live Match State",
            "GET",
            f"api/matches/{match_id}/live",
            200
        )
        if success:
            print(f"Live match state: {json.dumps(response, indent=2)}")
        return success, response

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

def test_live_match_workflow(tester, timestamp):
    """Test the complete live match workflow from creation to completion"""
    print("\n" + "=" * 80)
    print("🔍 TESTING LIVE MATCH WORKFLOW 🔍")
    print("=" * 80)
    
    # 1. Create teams for home and away
    home_team_name = f"Home Team {timestamp}"
    away_team_name = f"Away Team {timestamp}"
    
    home_team_id = tester.test_create_team(home_team_name, "U13")
    away_team_id = tester.test_create_team(away_team_name, "U13")
    
    if not home_team_id or not away_team_id:
        print("❌ Failed to create teams for live match test")
        return False
    
    # 2. Add players to both teams
    home_players = []
    away_players = []
    
    # Add players to home team
    for i in range(11):  # 11 players for starting lineup
        player_data = {
            "first_name": f"Home{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward" if i < 3 else ("Midfielder" if i < 7 else "Defender"),
            "squad_number": i + 1
        }
        player_id = tester.test_add_player(home_team_id, player_data)
        if player_id:
            home_players.append(player_id)
    
    # Add substitutes to home team
    for i in range(5):  # 5 substitutes
        player_data = {
            "first_name": f"HomeSub{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward" if i < 2 else ("Midfielder" if i < 3 else "Defender"),
            "squad_number": i + 12
        }
        player_id = tester.test_add_player(home_team_id, player_data)
        if player_id:
            home_players.append(player_id)
    
    # Add players to away team
    for i in range(11):  # 11 players for starting lineup
        player_data = {
            "first_name": f"Away{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward" if i < 3 else ("Midfielder" if i < 7 else "Defender"),
            "squad_number": i + 1
        }
        player_id = tester.test_add_player(away_team_id, player_data)
        if player_id:
            away_players.append(player_id)
    
    # Add substitutes to away team
    for i in range(5):  # 5 substitutes
        player_data = {
            "first_name": f"AwaySub{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward" if i < 2 else ("Midfielder" if i < 3 else "Defender"),
            "squad_number": i + 12
        }
        player_id = tester.test_add_player(away_team_id, player_data)
        if player_id:
            away_players.append(player_id)
    
    if len(home_players) < 11 or len(away_players) < 11:
        print("❌ Failed to create enough players for live match test")
        return False
    
    # 3. Create a match with lineups and positions
    # Create position mappings for 4-4-2 formation
    home_positions = {}
    positions = ["GK", "LB", "CB1", "CB2", "RB", "LM", "CM1", "CM2", "RM", "ST1", "ST2"]
    for i, player_id in enumerate(home_players[:11]):
        if i < len(positions):
            home_positions[positions[i]] = player_id
    
    # Create position mappings for 4-3-3 formation
    away_positions = {}
    positions = ["GK", "LB", "CB1", "CB2", "RB", "CM1", "CM2", "CM3", "LW", "ST", "RW"]
    for i, player_id in enumerate(away_players[:11]):
        if i < len(positions):
            away_positions[positions[i]] = player_id
    
    match_date = (datetime.now() + timedelta(days=1)).isoformat()
    match_data = {
        "home_team_id": home_team_id,
        "away_team_id": away_team_id,
        "date": match_date,
        "venue": "Live Match Test Stadium",
        "home_formation": "4-4-2",
        "away_formation": "4-3-3",
        "match_format": "11v11",
        "match_type": "League",
        "home_lineup": home_players[:11],
        "away_lineup": away_players[:11],
        "home_substitutes": home_players[11:16],
        "away_substitutes": away_players[11:16],
        "home_positions": home_positions,
        "away_positions": away_positions,
        "score_home": 0,
        "score_away": 0,
        "status": "scheduled"
    }
    
    success, response = tester.run_test(
        "Create Live Match",
        "POST",
        "api/matches",
        200,
        data=match_data
    )
    
    if not success or 'match_id' not in response:
        print("❌ Failed to create match for live match test")
        return False
    
    match_id = response['match_id']
    print(f"✅ Created match with ID: {match_id}")
    
    # 4. Start the match
    if not tester.test_start_match(match_id):
        print("❌ Failed to start match")
        return False
    
    print("✅ Successfully started match")
    
    # 5. Test match phase controls and event recording
    
    # First half events
    print("\n📋 FIRST HALF EVENTS")
    
    # Home team goal at minute 15
    goal_event_id = tester.test_add_match_event(match_id, home_players[9], "goal", minute=15)
    if not goal_event_id:
        print("❌ Failed to add goal event for home team")
    
    # Away team yellow card at minute 20
    yellow_card_event_id = tester.test_add_match_event(match_id, away_players[5], "yellow_card", minute=20)
    if not yellow_card_event_id:
        print("❌ Failed to add yellow card event for away team")
    
    # Home team assist at minute 25
    assist_event_id = tester.test_add_match_event(match_id, home_players[7], "assist", minute=25)
    if not assist_event_id:
        print("❌ Failed to add assist event for home team")
    
    # Away team goal at minute 30
    away_goal_event_id = tester.test_add_match_event(match_id, away_players[9], "goal", minute=30)
    if not away_goal_event_id:
        print("❌ Failed to add goal event for away team")
    
    # Check live match state after first half events
    success, first_half_state = tester.test_get_live_match_state(match_id)
    if not success:
        print("❌ Failed to get live match state after first half events")
    else:
        # Verify events were added to the match
        if 'events' in first_half_state and len(first_half_state['events']) >= 4:
            print(f"✅ First half events verified in live state: {len(first_half_state['events'])} events found")
        else:
            print("❌ First half events not found in live match state")
        
        # Verify score updates
        home_score = first_half_state.get('score_home', 0)
        away_score = first_half_state.get('score_away', 0)
        if home_score == 1 and away_score == 1:
            print(f"✅ Score correctly updated: Home {home_score} - {away_score} Away")
        else:
            print(f"❌ Score not correctly updated: Home {home_score} - {away_score} Away")
    
    # Half time - Update match status
    half_time_data = {
        "status": "half_time"
    }
    
    success, response = tester.run_test(
        "Set Half Time",
        "PUT",
        f"api/matches/{match_id}",
        200,
        data=half_time_data
    )
    
    if not success:
        print("❌ Failed to set match to half time")
    else:
        print("✅ Successfully set match to half time")
    
    # Second half - Update match status
    second_half_data = {
        "status": "live"
    }
    
    success, response = tester.run_test(
        "Start Second Half",
        "PUT",
        f"api/matches/{match_id}",
        200,
        data=second_half_data
    )
    
    if not success:
        print("❌ Failed to start second half")
    else:
        print("✅ Successfully started second half")
    
    # Second half events
    print("\n📋 SECOND HALF EVENTS")
    
    # Home team red card at minute 55
    red_card_event_id = tester.test_add_match_event(match_id, home_players[3], "red_card", minute=55)
    if not red_card_event_id:
        print("❌ Failed to add red card event for home team")
    
    # Away team goal at minute 70
    away_goal_event_id = tester.test_add_match_event(match_id, away_players[8], "goal", minute=70)
    if not away_goal_event_id:
        print("❌ Failed to add second goal event for away team")
    
    # Home team goal at minute 85
    home_goal_event_id = tester.test_add_match_event(match_id, home_players[10], "goal", minute=85)
    if not home_goal_event_id:
        print("❌ Failed to add second goal event for home team")
    
    # Check live match state after second half events
    success, second_half_state = tester.test_get_live_match_state(match_id)
    if not success:
        print("❌ Failed to get live match state after second half events")
    else:
        # Verify events were added to the match
        if 'events' in second_half_state and len(second_half_state['events']) >= 7:
            print(f"✅ Second half events verified in live state: {len(second_half_state['events'])} events found")
        else:
            print("❌ Second half events not found in live match state")
        
        # Verify score updates
        home_score = second_half_state.get('score_home', 0)
        away_score = second_half_state.get('score_away', 0)
        if home_score == 2 and away_score == 2:
            print(f"✅ Score correctly updated: Home {home_score} - {away_score} Away")
        else:
            print(f"❌ Score not correctly updated: Home {home_score} - {away_score} Away")
    
    # Full time - Update match status
    full_time_data = {
        "status": "completed"
    }
    
    success, response = tester.run_test(
        "Set Full Time",
        "PUT",
        f"api/matches/{match_id}",
        200,
        data=full_time_data
    )
    
    if not success:
        print("❌ Failed to set match to full time")
    else:
        print("✅ Successfully set match to full time")
    
    # 6. Verify match data persistence
    success, final_match_state = tester.run_test(
        "Get Final Match State",
        "GET",
        f"api/matches/{match_id}",
        200
    )
    
    if not success:
        print("❌ Failed to get final match state")
        return False
    
    # Verify final match state
    if final_match_state.get('status') == 'completed':
        print("✅ Match status correctly set to completed")
    else:
        print(f"❌ Match status not correctly set to completed: {final_match_state.get('status')}")
    
    if 'events' in final_match_state and len(final_match_state['events']) >= 7:
        print(f"✅ All match events persisted: {len(final_match_state['events'])} events found")
    else:
        print("❌ Match events not correctly persisted")
    
    # 7. Verify player statistics updates
    print("\n📋 VERIFYING PLAYER STATISTICS UPDATES")
    
    # Check home team goal scorer stats
    success, home_players_response = tester.run_test(
        "Get Home Team Players After Match",
        "GET",
        f"api/teams/{home_team_id}/players",
        200
    )
    
    if success:
        # Find the goal scorers
        home_scorer1 = next((p for p in home_players_response if p.get('id') == home_players[9]), None)
        home_scorer2 = next((p for p in home_players_response if p.get('id') == home_players[10]), None)
        
        if home_scorer1 and 'stats' in home_scorer1 and home_scorer1['stats'].get('goals', 0) > 0:
            print(f"✅ Home player 1 stats updated: goals = {home_scorer1['stats']['goals']}")
        else:
            print("❌ Home player 1 goal stats not updated")
            
        if home_scorer2 and 'stats' in home_scorer2 and home_scorer2['stats'].get('goals', 0) > 0:
            print(f"✅ Home player 2 stats updated: goals = {home_scorer2['stats']['goals']}")
        else:
            print("❌ Home player 2 goal stats not updated")
    
    # Check away team goal scorer stats
    success, away_players_response = tester.run_test(
        "Get Away Team Players After Match",
        "GET",
        f"api/teams/{away_team_id}/players",
        200
    )
    
    if success:
        # Find the goal scorers
        away_scorer1 = next((p for p in away_players_response if p.get('id') == away_players[9]), None)
        away_scorer2 = next((p for p in away_players_response if p.get('id') == away_players[8]), None)
        
        if away_scorer1 and 'stats' in away_scorer1 and away_scorer1['stats'].get('goals', 0) > 0:
            print(f"✅ Away player 1 stats updated: goals = {away_scorer1['stats']['goals']}")
        else:
            print("❌ Away player 1 goal stats not updated")
            
        if away_scorer2 and 'stats' in away_scorer2 and away_scorer2['stats'].get('goals', 0) > 0:
            print(f"✅ Away player 2 stats updated: goals = {away_scorer2['stats']['goals']}")
        else:
            print("❌ Away player 2 goal stats not updated")
    
    # 8. Clean up - Delete teams
    print("\n📋 CLEANING UP TEST DATA")
    
    if not tester.test_delete_team(home_team_id):
        print(f"❌ Failed to delete home team")
    
    if not tester.test_delete_team(away_team_id):
        print(f"❌ Failed to delete away team")
    
    print("\n" + "=" * 80)
    print("🔍 LIVE MATCH WORKFLOW TEST COMPLETED 🔍")
    print("=" * 80)
    
    return True

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
    
    # 3. Player Management with Enhanced Player Model
    print("\n📋 SECTION 3: ENHANCED PLAYER MANAGEMENT")
    
    # Sample base64 image (small transparent pixel)
    sample_photo_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    
    # Test adding players to teams with photos and stats
    player_ids = {}
    for age_group, team_id in team_ids.items():
        players = []
        for i in range(10):  # Add 10 players to each team for lineup testing
            player_data = {
                "first_name": f"Player{i}",
                "last_name": f"Test{timestamp}",
                "age": 10 if age_group == "U13" else (6 if age_group == "U7" else 16),
                "position": "Forward" if i < 3 else ("Midfielder" if i < 7 else "Defender"),
                "squad_number": i + 1,
                "stats": {
                    "appearances": 0,
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "minutes_played": 0
                }
            }
            
            # Add some players with photos
            if i % 3 == 0:
                player_id = tester.test_add_player_with_photo(team_id, player_data, sample_photo_base64)
            else:
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
    
    # 5. Enhanced Match Management with Live Features
    print("\n📋 SECTION 5: ENHANCED MATCH MANAGEMENT")
    
    # We need at least two teams to create a match
    if len(team_ids) >= 2 and all(len(player_ids.get(team_id, [])) > 0 for team_id in list(team_ids.values())[:2]):
        team_id_list = list(team_ids.values())
        home_team_id = team_id_list[0]
        away_team_id = team_id_list[1]
        
        home_players = player_ids.get(home_team_id, [])
        away_players = player_ids.get(away_team_id, [])
        
        # Test creating a match with lineups and positions
        match_id = tester.test_create_match_with_lineups(home_team_id, away_team_id, home_players, away_players)
        if not match_id:
            print("❌ Failed to create match with lineups")
            # Try creating a simple match as fallback
            match_id = tester.test_create_match(home_team_id, away_team_id)
            if not match_id:
                print("❌ Failed to create match, skipping match tests")
                match_id = None
        
        if match_id:
            # Test retrieving match details
            if not tester.test_get_match(match_id):
                print("❌ Failed to get match details")
            
            # Test starting the match
            if not tester.test_start_match(match_id):
                print("❌ Failed to start match")
            else:
                print("✅ Successfully started match")
                
                # Test adding match events
                event_types = ["goal", "assist", "yellow_card", "red_card"]
                event_ids = []
                
                # Add events for home team players
                for i, event_type in enumerate(event_types):
                    if i < len(home_players):
                        event_id = tester.test_add_match_event(match_id, home_players[i], event_type, minute=10+i*5)
                        if event_id:
                            event_ids.append(event_id)
                        else:
                            print(f"❌ Failed to add {event_type} event")
                
                # Test getting live match state
                success, live_state = tester.test_get_live_match_state(match_id)
                if not success:
                    print("❌ Failed to get live match state")
                else:
                    # Verify events were added to the match
                    if 'events' in live_state and len(live_state['events']) > 0:
                        print(f"✅ Match events verified in live state: {len(live_state['events'])} events found")
                    else:
                        print("❌ No events found in live match state")
                
                # 6. Test Player Statistics Updates
                print("\n📋 SECTION 6: PLAYER STATISTICS UPDATES")
                
                # Get player stats after events
                for i, player_id in enumerate(home_players):
                    if i < len(event_types):
                        # Get the player to check stats
                        success, player_response = tester.run_test(
                            f"Get Player After {event_types[i]} Event",
                            "GET",
                            f"api/teams/{home_team_id}/players",
                            200
                        )
                        
                        if success:
                            # Find the player in the response
                            player = next((p for p in player_response if p.get('id') == player_id), None)
                            if player and 'stats' in player:
                                event_type = event_types[i]
                                stat_field = f"{event_type}s" if event_type != "red_card" and event_type != "yellow_card" else f"{event_type}"
                                
                                if event_type == "goal" and player['stats']['goals'] > 0:
                                    print(f"✅ Player {player_id} stats updated: goals = {player['stats']['goals']}")
                                elif event_type == "assist" and player['stats']['assists'] > 0:
                                    print(f"✅ Player {player_id} stats updated: assists = {player['stats']['assists']}")
                                elif event_type == "yellow_card" and player['stats']['yellow_cards'] > 0:
                                    print(f"✅ Player {player_id} stats updated: yellow_cards = {player['stats']['yellow_cards']}")
                                elif event_type == "red_card" and player['stats']['red_cards'] > 0:
                                    print(f"✅ Player {player_id} stats updated: red_cards = {player['stats']['red_cards']}")
                                else:
                                    print(f"❌ Player {player_id} stats not updated for {event_type}")
                            else:
                                print(f"❌ Could not find player {player_id} or stats field missing")
                
                # 7. Test Team Statistics
                print("\n📋 SECTION 7: TEAM STATISTICS")
                
                # Test getting team statistics
                success, stats = tester.test_get_team_statistics(home_team_id)
                if not success:
                    print("❌ Failed to get team statistics")
                else:
                    # Verify team statistics
                    if 'statistics' in stats:
                        print(f"✅ Team statistics retrieved successfully")
                    else:
                        print("❌ Team statistics not found in response")
                    
                    # Verify player statistics in team stats
                    if 'players' in stats and len(stats['players']) > 0:
                        player_with_stats = next((p for p in stats['players'] if any(p.get('stats', {}).get(stat, 0) > 0 for stat in ['goals', 'assists', 'yellow_cards', 'red_cards'])), None)
                        if player_with_stats:
                            print(f"✅ Player statistics verified in team stats: {json.dumps(player_with_stats['stats'], indent=2)}")
                        else:
                            print("❌ No players with updated stats found in team statistics")
                    else:
                        print("❌ No players found in team statistics")
    else:
        print("⚠️ Skipping match tests - need at least two teams with players")
    
    # 8. Error Handling
    print("\n📋 SECTION 8: ERROR HANDLING")
    
    # Test invalid endpoint
    if not tester.test_invalid_endpoint():
        print("❌ Failed invalid endpoint test")
    
    # Test invalid team ID
    if not tester.test_invalid_team_id():
        print("❌ Failed invalid team ID test")
    
    # Test missing required fields
    if not tester.test_missing_required_fields():
        print("❌ Failed missing required fields test")
    
    # 9. Cleanup - Delete teams
    print("\n📋 SECTION 9: CLEANUP")
    for age_group, team_id in team_ids.items():
        if not tester.test_delete_team(team_id):
            print(f"❌ Failed to delete {age_group} team")
    
    # Print results
    print("\n" + "=" * 80)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    print("=" * 80)
    print("🔍 BACKEND API TESTS COMPLETED 🔍\n")
    
    # Run the live match workflow test
    print("\n" + "=" * 80)
    print("🔍 RUNNING LIVE MATCH WORKFLOW TEST 🔍")
    print("=" * 80)
    
    live_match_success = test_live_match_workflow(tester, timestamp)
    
    if live_match_success:
        print("\n✅ Live match workflow test completed successfully")
    else:
        print("\n❌ Live match workflow test failed")
    
    return 0 if tester.tests_passed == tester.tests_run and live_match_success else 1

if __name__ == "__main__":
    sys.exit(main())
