import base64
import io
import os
import warnings
import random

import requests
from PIL import Image
from stability_sdk import client
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
from dotenv import load_dotenv
from api_key_manager import initialize_stability_key_manager

load_dotenv()
os.environ['STABILITY_HOST'] = 'grpc.stability.ai:443'

seed = random.randint(0, 1000000000)

# Initialize Stability API key manager
try:
    stability_key_manager = initialize_stability_key_manager()
except Exception as e:
    print(f"⚠️ Stability API key manager initialization failed: {e}")
    stability_key_manager = None

# Global variable to hold current API client
stability_api = None

def create_stability_client(api_key):
    """Create a Stability API client with the given key"""
    return client.StabilityInference(
        key=api_key,
        verbose=True,
        engine="stable-diffusion-xl-1024-v1-0",
    )

def text_to_image_with_key(api_key, prompt):
    """Generate image using specific API key"""
    stability_client = create_stability_client(api_key)
    
    # Set up our initial generation parameters.
    answers = stability_client.generate(
        prompt=prompt,
        seed=seed,
        steps=30,
        cfg_scale=8.0,
        width=1024,
        height=1024,
        sampler=generation.SAMPLER_K_DPMPP_2M
    )
    
    for resp in answers:
        for artifact in resp.artifacts:
            if artifact.finish_reason == generation.FILTER:
                warnings.warn(
                    "Your request activated the API's safety filters and could not be processed."
                    "Please modify the prompt and try again.")
            if artifact.type == generation.ARTIFACT_IMAGE:
                img = Image.open(io.BytesIO(artifact.binary))
                return img
    
    return None

def text_to_image(prompt):
    """Generate image with automatic API key fallback"""
    if not stability_key_manager:
        # Fallback to single key if manager not available
        single_key = os.getenv("STABILITY_KEY")
        if not single_key:
            raise Exception("No Stability API keys configured")
        return text_to_image_with_key(single_key, prompt)
    
    # Use key manager with fallback
    return stability_key_manager.execute_with_fallback(text_to_image_with_key, prompt)

    # using newer api for sdxl v1.6
    # load_dotenv()
    #
    # engine_id = "stable-diffusion-v1-6"
    # api_host = 'https://api.stability.ai'
    # api_key = os.getenv("STABILITY_KEY")
    #
    # if api_key is None:
    #     raise Exception("Missing Stability API key.")
    #
    # response = requests.post(
    #     f"{api_host}/v1/generation/{engine_id}/text-to-image",
    #     headers={
    #         "Content-Type": "application/json",
    #         "Accept": "application/json",
    #         "Authorization": f"Bearer {api_key}"
    #     },
    #     json={
    #         "text_prompts": [
    #             {
    #                 "text": "a young man in his 20s, looking shocked at the chaos happening in the city, cartoon box, american comic colored, cartoon box"
    #             }
    #         ],
    #         "cfg_scale": 8,
    #         "seed": 123,
    #         "height": 1024,
    #         "width": 1024,
    #         "samples": 1,
    #         "steps": 30,
    #     },
    # )
    #
    # if response.status_code != 200:
    #     raise Exception("Non-200 response: " + str(response.text))
    #
    # data = response.json()
    #
    # for i, image in enumerate(data["artifacts"]):
    #     with open(f"./output/v1_txt2img_{i}.png", "wb") as f:
    #         global img
    #         img = Image.open(io.BytesIO(base64.b64decode(image["base64"])))
    #         f.write(base64.b64decode(image["base64"]))
    # return img



def edit_image_with_key(api_key, input_image_path, prompt, output_image_name):
    """Edit image using specific API key"""
    img = Image.open(input_image_path)
    stability_client = create_stability_client(api_key)

    # Set up our initial generation parameters.
    answers = stability_client.generate(
        prompt=prompt,
        init_image=img,
        start_schedule=0.6,
        seed=123463446,
        steps=50,
        cfg_scale=8.0,
        width=512,
        height=512,
        sampler=generation.SAMPLER_K_DPMPP_2M
    )

    # Set up our warning to print to the console if the adult content classifier is tripped.
    # If adult content classifier is not tripped, save generated image.
    for resp in answers:
        for artifact in resp.artifacts:
            if artifact.finish_reason == generation.FILTER:
                warnings.warn(
                    "Your request activated the API's safety filters and could not be processed."
                    "Please modify the prompt and try again.")
            if artifact.type == generation.ARTIFACT_IMAGE:
                img2 = Image.open(io.BytesIO(artifact.binary))
                img2.save(output_image_name + ".png")
                return img2
    return None

def edit_image(input_image_path, prompt, output_image_name):
    """Edit image with automatic API key fallback"""
    if not stability_key_manager:
        # Fallback to single key if manager not available
        single_key = os.getenv("STABILITY_KEY")
        if not single_key:
            raise Exception("No Stability API keys configured")
        return edit_image_with_key(single_key, input_image_path, prompt, output_image_name)
    
    # Use key manager with fallback
    return stability_key_manager.execute_with_fallback(edit_image_with_key, input_image_path, prompt, output_image_name)
