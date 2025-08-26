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

load_dotenv()
os.environ['STABILITY_HOST'] = 'grpc.stability.ai:443'

seed = random.randint(0, 1000000000)

# Set up our connection to the API.
stability_api = client.StabilityInference(
    key=os.getenv("STABILITY_KEY"),
    verbose=True, # Print debug messages.
    engine="stable-diffusion-xl-1024-v1-0", # Set the engine to use for generation.
)

def text_to_image(prompt):
    # Set up our initial generation parameters.
    answers = stability_api.generate(
        prompt=prompt,
        seed=seed,
        steps=30,
        cfg_scale=8.0,

        width=1024,
        height=1024,
        sampler=generation.SAMPLER_K_DPMPP_2M )
    for resp in answers:
        for artifact in resp.artifacts:
            if artifact.finish_reason == generation.FILTER:
                warnings.warn(
                    "Your request activated the API's safety filters and could not be processed."
                    "Please modify the prompt and try again.")
            if artifact.type == generation.ARTIFACT_IMAGE:
                global img
                img = Image.open(io.BytesIO(artifact.binary))
                return img

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



def edit_image(input_image_path, prompt, output_image_name):
    img = Image.open(input_image_path)

    # Set up our initial generation parameters.
    answers = stability_api.generate(
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
                global img2
                img2 = Image.open(io.BytesIO(artifact.binary))
                img2.save(output_image_name + ".png") # Save our generated image with its seed number as the filename and the img2img suffix so that we know this is our transformed image.
