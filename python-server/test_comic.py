#!/usr/bin/env python3
"""
Test script for comic generation
"""
import requests
import json

def test_comic_generation():
    """Test the comic generation endpoint"""
    url = "http://localhost:5001/generate-comic"
    
    test_story = "Two friends discover a magical portal in their backyard that leads to a world where animals can talk and they must help save the forest from an evil wizard."
    
    payload = {
        "story": test_story
    }
    
    print("🧪 Testing comic generation...")
    print(f"📖 Story: {test_story}")
    print("⏳ Generating comic (this may take a few minutes)...")
    
    try:
        response = requests.post(url, json=payload, timeout=300)  # 5 minute timeout
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Comic generation successful!")
                print(f"🖼️  Comic URL: {result['comic_url']}")
                print(f"👥 Characters: {result['characters_description']}")
                print(f"🎨 Style: {result['style']}")
                print(f"📋 Panels: {len(result['panels'])}")
                
                for i, panel in enumerate(result['panels'], 1):
                    print(f"   Panel {i}: {panel['description']}")
                    if panel['text']:
                        print(f"   Text: {panel['text']}")
            else:
                print(f"❌ Comic generation failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - comic generation takes time")
    except requests.exceptions.ConnectionError:
        print("🔌 Connection error - make sure the server is running on localhost:5001")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_check():
    """Test the health check endpoint"""
    url = "http://localhost:5001/health"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health check: {result['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

if __name__ == "__main__":
    print("🎨 Comic Generation Server Test")
    print("=" * 40)
    
    # Test health check first
    if test_health_check():
        print()
        test_comic_generation()
    else:
        print("❌ Server is not running. Start it with: python start.py")