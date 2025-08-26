from flask import Flask, request, jsonify
import os
import json
import base64
import requests
from io import BytesIO
from generation import generate_characters_description, get_panels, generate_comic
from create_strip import create_strip
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Fixed parameters for comic generation
FIXED_NUM_CHARACTERS = 2
FIXED_STYLE = "manga, black and white"
AUTO_GENERATE_CHARACTERS = True

def upload_to_imgbb(image, api_key):
    """Upload image to imgbb and return the URL"""
    try:
        # Convert PIL image to base64
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        # Upload to imgbb
        url = "https://api.imgbb.com/1/upload"
        payload = {
            "key": api_key,
            "image": img_str,
        }
        
        response = requests.post(url, data=payload)
        result = response.json()
        
        if result.get("success"):
            return result["data"]["url"]
        else:
            raise Exception(f"imgbb upload failed: {result.get('error', {}).get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"Error uploading to imgbb: {e}")
        raise

@app.route('/generate-comic', methods=['POST'])
def generate_comic_strip():
    try:
        data = request.get_json()
        story = data.get('story')
        
        if not story:
            return jsonify({"error": "Story is required"}), 400
            
        imgbb_api_key = os.getenv('IMGBB_API_KEY')
        if not imgbb_api_key:
            return jsonify({"error": "IMGBB_API_KEY not configured"}), 500
        
        print(f"🎨 Starting comic generation for story: {story[:100]}...")
        
        # Generate character descriptions automatically
        characters_description = generate_characters_description(story)
        print(f"📝 Generated characters: {characters_description}")
        
        # Create scenario with characters
        scenario = f"Characters: {characters_description}\nStory: {story}"
        
        # Generate panels
        panels = get_panels(scenario, FIXED_STYLE)
        print(f"📋 Generated {len(panels)} panels")
        
        # Generate comic images (returns PIL Image directly)
        comic_image = generate_comic(panels, FIXED_STYLE, characters_description)
        
        if not comic_image:
            return jsonify({"error": "Comic generation failed - no image generated"}), 500
            
        # Upload the comic strip directly to imgbb (no local file needed)
        comic_url = upload_to_imgbb(comic_image, imgbb_api_key)
        
        print(f"✅ Comic uploaded to: {comic_url}")
        
        # Prepare panel data for response
        panel_data = []
        for i, panel in enumerate(panels):
            panel_data.append({
                "panelNumber": i + 1,
                "description": panel.get("description", ""),
                "text": panel.get("text", ""),
            })
        
        return jsonify({
            "success": True,
            "comic_url": comic_url,
            "panels": panel_data,
            "characters_description": characters_description,
            "style": FIXED_STYLE
        })
        
    except Exception as e:
        print(f"❌ Comic generation error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Comic generation server is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5001, host="0.0.0.0")
