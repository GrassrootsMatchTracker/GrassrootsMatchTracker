import requests
from bs4 import BeautifulSoup
import sys

def test_frontend():
    """Test the frontend by checking for expected HTML elements"""
    print("Testing frontend...")
    
    try:
        # Get the frontend HTML
        response = requests.get("http://localhost:3000")
        if response.status_code != 200:
            print(f"❌ Failed to access frontend: Status code {response.status_code}")
            return False
        
        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check for the root div (React mount point)
        root_div = soup.find('div', id='root')
        if not root_div:
            print("❌ Root div not found - React app may not be mounting")
            return False
        
        print("✅ React app mount point found")
        
        # Check for the bundle.js script
        bundle_script = soup.find('script', src=lambda src: src and 'bundle.js' in src)
        if not bundle_script:
            print("❌ Bundle.js script not found - React app may not be loading")
            return False
        
        print("✅ React bundle script found")
        
        # Since we can't easily check the rendered content (would need a headless browser),
        # we'll just check that the basic structure is there
        print("✅ Frontend HTML structure looks correct")
        return True
        
    except Exception as e:
        print(f"❌ Error testing frontend: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_frontend()
    sys.exit(0 if success else 1)