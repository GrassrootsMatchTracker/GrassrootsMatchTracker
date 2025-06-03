import requests
import sys
import json
import uuid
from datetime import datetime

class GrassrootsMatchTrackerTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

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
        success, response = self.run_test(
            "Create Team",
            "POST",
            "api/teams",
            200,
            data={"name": team_name, "age_group": age_group}
        )
        if success and 'team_id' in response:
            print(f"Created team with ID: {response['team_id']}")
            return response['team_id']
        return None

    def test_get_team(self, team_id):
        """Test getting a specific team"""
        success, response = self.run_test(
            "Get Team",
            "GET",
            f"api/teams/{team_id}",
            200
        )
        if success:
            print(f"Team details: {json.dumps(response, indent=2)}")
        return success

def main():
    # Setup
    tester = GrassrootsMatchTrackerTester("http://localhost:8001")
    test_team_name = f"Test Team {datetime.now().strftime('%Y%m%d%H%M%S')}"
    test_age_group = "U13"

    print("\n" + "=" * 50)
    print("🔍 STARTING BACKEND API TESTS 🔍")
    print("=" * 50)

    # Test getting all teams
    if not tester.test_get_teams():
        print("❌ Failed to get teams, stopping tests")
        return 1

    # Test creating a team
    team_id = tester.test_create_team(test_team_name, test_age_group)
    if not team_id:
        print("❌ Failed to create team, stopping tests")
        return 1

    # Test getting the created team
    if not tester.test_get_team(team_id):
        print("❌ Failed to get created team")
        return 1

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("=" * 50)
    print("🔍 BACKEND API TESTS COMPLETED 🔍\n")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
