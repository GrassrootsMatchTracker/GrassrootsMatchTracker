import requests
import sys
import json
import uuid
from datetime import datetime, timedelta

def test_score_updates():
    """Test that scores are updated correctly when goal events are added"""
    base_url = "https://b6dbc3a7-e80c-4140-9b06-8fd7858fdaef.preview.emergentagent.com"
    headers = {'Content-Type': 'application/json'}
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    print("\n" + "=" * 80)
    print("🔍 TESTING MATCH SCORE UPDATES 🔍")
    print("=" * 80)
    
    # 1. Create home and away teams
    home_team_name = f"Home Team {timestamp}"
    away_team_name = f"Away Team {timestamp}"
    
    # Create home team
    home_team_data = {
        "name": home_team_name, 
        "age_group": "U13",
        "logo_url": "https://example.com/logo.png"
    }
    
    response = requests.post(f"{base_url}/api/teams", json=home_team_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to create home team: {response.text}")
        return False
    
    home_team_id = response.json()['team_id']
    print(f"✅ Created home team with ID: {home_team_id}")
    
    # Create away team
    away_team_data = {
        "name": away_team_name, 
        "age_group": "U13",
        "logo_url": "https://example.com/logo.png"
    }
    
    response = requests.post(f"{base_url}/api/teams", json=away_team_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to create away team: {response.text}")
        return False
    
    away_team_id = response.json()['team_id']
    print(f"✅ Created away team with ID: {away_team_id}")
    
    # 2. Add players to both teams
    home_players = []
    away_players = []
    
    # Add players to home team
    for i in range(3):
        player_data = {
            "first_name": f"Home{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward",
            "squad_number": i + 1
        }
        
        response = requests.post(f"{base_url}/api/teams/{home_team_id}/players", json=player_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to add player to home team: {response.text}")
            continue
        
        player_id = response.json()['player_id']
        home_players.append(player_id)
        print(f"✅ Added player to home team with ID: {player_id}")
    
    # Add players to away team
    for i in range(3):
        player_data = {
            "first_name": f"Away{i}",
            "last_name": f"Player{timestamp}",
            "age": 12,
            "position": "Forward",
            "squad_number": i + 1
        }
        
        response = requests.post(f"{base_url}/api/teams/{away_team_id}/players", json=player_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to add player to away team: {response.text}")
            continue
        
        player_id = response.json()['player_id']
        away_players.append(player_id)
        print(f"✅ Added player to away team with ID: {player_id}")
    
    if len(home_players) == 0 or len(away_players) == 0:
        print("❌ Failed to add players to teams")
        return False
    
    # 3. Create a match
    match_date = (datetime.now() + timedelta(days=1)).isoformat()
    match_data = {
        "home_team_id": home_team_id,
        "away_team_id": away_team_id,
        "date": match_date,
        "venue": "Score Test Stadium",
        "home_formation": "4-4-2",
        "away_formation": "4-3-3",
        "match_format": "11v11",
        "match_type": "Friendly",
        "home_lineup": home_players,
        "away_lineup": away_players,
        "score_home": 0,
        "score_away": 0,
        "status": "scheduled"
    }
    
    response = requests.post(f"{base_url}/api/matches", json=match_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to create match: {response.text}")
        return False
    
    match_id = response.json()['match_id']
    print(f"✅ Created match with ID: {match_id}")
    
    # 4. Start the match
    response = requests.post(f"{base_url}/api/matches/{match_id}/start", json={}, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to start match: {response.text}")
        return False
    
    print("✅ Successfully started match")
    
    # 5. Add goal events and check score updates
    
    # Initial score check
    response = requests.get(f"{base_url}/api/matches/{match_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get initial match state: {response.text}")
        return False
    
    initial_score_home = response.json().get('score_home', 0)
    initial_score_away = response.json().get('score_away', 0)
    print(f"Initial score: Home {initial_score_home} - {initial_score_away} Away")
    
    # Add home team goal
    home_goal_event = {
        "match_id": match_id,
        "player_id": home_players[0],
        "event_type": "goal",
        "minute": 15,
        "additional_data": {}
    }
    
    response = requests.post(f"{base_url}/api/matches/{match_id}/events", json=home_goal_event, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to add home goal event: {response.text}")
        return False
    
    print("✅ Added home team goal event")
    
    # Check score after home goal
    response = requests.get(f"{base_url}/api/matches/{match_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get match state after home goal: {response.text}")
        return False
    
    home_goal_score_home = response.json().get('score_home', 0)
    home_goal_score_away = response.json().get('score_away', 0)
    print(f"Score after home goal: Home {home_goal_score_home} - {home_goal_score_away} Away")
    
    # Add away team goal
    away_goal_event = {
        "match_id": match_id,
        "player_id": away_players[0],
        "event_type": "goal",
        "minute": 30,
        "additional_data": {}
    }
    
    response = requests.post(f"{base_url}/api/matches/{match_id}/events", json=away_goal_event, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to add away goal event: {response.text}")
        return False
    
    print("✅ Added away team goal event")
    
    # Check score after away goal
    response = requests.get(f"{base_url}/api/matches/{match_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get match state after away goal: {response.text}")
        return False
    
    away_goal_score_home = response.json().get('score_home', 0)
    away_goal_score_away = response.json().get('score_away', 0)
    print(f"Score after away goal: Home {away_goal_score_home} - {away_goal_score_away} Away")
    
    # Add another home team goal
    home_goal_event2 = {
        "match_id": match_id,
        "player_id": home_players[1],
        "event_type": "goal",
        "minute": 45,
        "additional_data": {}
    }
    
    response = requests.post(f"{base_url}/api/matches/{match_id}/events", json=home_goal_event2, headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to add second home goal event: {response.text}")
        return False
    
    print("✅ Added second home team goal event")
    
    # Check score after second home goal
    response = requests.get(f"{base_url}/api/matches/{match_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get match state after second home goal: {response.text}")
        return False
    
    final_score_home = response.json().get('score_home', 0)
    final_score_away = response.json().get('score_away', 0)
    print(f"Final score: Home {final_score_home} - {final_score_away} Away")
    
    # 6. Verify score updates
    expected_home_score = initial_score_home + 2  # Two home goals
    expected_away_score = initial_score_away + 1  # One away goal
    
    if home_goal_score_home == initial_score_home + 1:
        print("✅ Home score correctly updated after first home goal")
    else:
        print(f"❌ Home score not updated after first home goal. Expected: {initial_score_home + 1}, Got: {home_goal_score_home}")
    
    if away_goal_score_away == initial_score_away + 1:
        print("✅ Away score correctly updated after away goal")
    else:
        print(f"❌ Away score not updated after away goal. Expected: {initial_score_away + 1}, Got: {away_goal_score_away}")
    
    if final_score_home == expected_home_score:
        print("✅ Final home score is correct")
    else:
        print(f"❌ Final home score is incorrect. Expected: {expected_home_score}, Got: {final_score_home}")
    
    if final_score_away == expected_away_score:
        print("✅ Final away score is correct")
    else:
        print(f"❌ Final away score is incorrect. Expected: {expected_away_score}, Got: {final_score_away}")
    
    # 7. Check live match endpoint
    response = requests.get(f"{base_url}/api/matches/{match_id}/live", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get live match state: {response.text}")
        return False
    
    live_score_home = response.json().get('score_home', 0)
    live_score_away = response.json().get('score_away', 0)
    print(f"Live match score: Home {live_score_home} - {live_score_away} Away")
    
    if live_score_home == expected_home_score and live_score_away == expected_away_score:
        print("✅ Live match scores are correct")
    else:
        print(f"❌ Live match scores are incorrect. Expected: {expected_home_score}-{expected_away_score}, Got: {live_score_home}-{live_score_away}")
    
    # 8. Count goal events and compare with scores
    response = requests.get(f"{base_url}/api/matches/{match_id}/live", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to get match events: {response.text}")
        return False
    
    events = response.json().get('events', [])
    home_goal_events = sum(1 for e in events if e.get('event_type') == 'goal' and e.get('player_id') in home_players)
    away_goal_events = sum(1 for e in events if e.get('event_type') == 'goal' and e.get('player_id') in away_players)
    
    print(f"Goal events count: Home {home_goal_events}, Away {away_goal_events}")
    
    if home_goal_events == 2 and away_goal_events == 1:
        print("✅ Goal events count matches expected values")
    else:
        print(f"❌ Goal events count doesn't match. Expected: Home 2, Away 1. Got: Home {home_goal_events}, Away {away_goal_events}")
    
    if home_goal_events == final_score_home and away_goal_events == final_score_away:
        print("✅ Goal events count matches final scores")
    else:
        print(f"❌ Goal events count doesn't match final scores. Events: Home {home_goal_events}, Away {away_goal_events}. Scores: Home {final_score_home}, Away {final_score_away}")
    
    # 9. Clean up - Delete teams
    print("\n📋 CLEANING UP TEST DATA")
    
    response = requests.delete(f"{base_url}/api/teams/{home_team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to delete home team: {response.text}")
    else:
        print(f"✅ Deleted home team")
    
    response = requests.delete(f"{base_url}/api/teams/{away_team_id}", headers=headers)
    if response.status_code != 200:
        print(f"❌ Failed to delete away team: {response.text}")
    else:
        print(f"✅ Deleted away team")
    
    print("\n" + "=" * 80)
    print("🔍 MATCH SCORE UPDATES TEST COMPLETED 🔍")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    test_score_updates()