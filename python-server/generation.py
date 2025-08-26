import json
from generate_panels import generate_panels
from stability_ai import text_to_image
from add_text import add_text_to_panel
from create_strip import create_strip
from dotenv import load_dotenv
from utils import load_llm_model
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from prompts import CHARACTER_DESCRIPTION_PROMPT, IMAGE_PROMPT_REFINE

load_dotenv()


# SCENARIO = """
# Characters: Adrien is a guy with blond hair. Vincent is a guy with black hair.
# Story: Adrien and Vincent work at the office and want to start a new product, and they create it in one night before presenting it to the board.
# """
# STYLE = "american comic, colored"


def generate_characters_description(story):
    llm = load_llm_model("Groq", "openai/gpt-oss-20b")
    prompt = PromptTemplate.from_template(CHARACTER_DESCRIPTION_PROMPT)
    characters_description = llm.invoke(prompt.format(scenario=story))
    return characters_description.content


def refine_image_gen_prompt(panel):
    llm = load_llm_model("Groq", "openai/gpt-oss-20b")
    prompt = PromptTemplate.from_template(IMAGE_PROMPT_REFINE)
    refined_prompt = llm.invoke(prompt.format(characters_description=panel))
    return refined_prompt.content


def get_panels(scenario, style):
    SCENARIO = scenario
    STYLE = style
    print(f"Generate panels with style '{STYLE}' for this scenario: \n {SCENARIO}")
    panels = generate_panels(SCENARIO)
    return panels


def generate_comic(panels, style, characters_description):
    STYLE = style
    # No need to save panels.json locally - just log for debugging
    print(f"📋 Processing {len(panels)} panels: {json.dumps(panels, indent=2)}")

    panel_images = []

    for panel in panels:
        panel_prompt = panel["description"] + ", cartoon box, " + STYLE
        panel_prompt = "Characters: " + characters_description + "\n Story : " + panel_prompt#
        panel_prompt = refine_image_gen_prompt(panel_prompt)
        panel_prompt = panel_prompt + ", cartoon box, " + STYLE#
        print(f"Generate panel {panel['number']} with prompt: {panel_prompt}")
        panel_image = text_to_image(panel_prompt)
        try:
            panel_image_with_text = add_text_to_panel(panel["text"], panel_image)
        except Exception as e:
            print(f"Error adding text to panel {panel['number']}: {e}")
            panel_image_with_text = panel_image
        # No need to save individual panels - keep in memory
        panel_images.append(panel_image_with_text)

    # Return the comic strip image directly instead of saving to file
    return create_strip(panel_images)

# desc = generate_characters_description("Adrien and Vincent work at the office and want to start a new product, and they create it in one night before presenting it to the board.")
# print(desc)
