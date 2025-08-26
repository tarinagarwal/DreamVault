CONTENT_GENERATION_PROMPT = """
Your role is of a Cartoonist who is responsible for creating a comic strip based on a short scenario.

You will be given a short scenario, you MUST split it in 6 parts.
Each part will be a different cartoon panel.
For each cartoon panel, you will write a description of it with:
 - the characters in the panel, they must be described precisely each time
 - the background of the panel

You MUST follow these instructions else you will be penalized:
Instructions:
- The description should be only word or group of word delimited by a comma, no sentence.
- Always use the characters descriptions instead of their name in the cartoon panel description.
- You can not use the same description twice.
- You will also write the text of the panel.
- The text should not be more than 2 small sentences.
- Each sentence should start by the character name

Example input:
Characters: Adrien is a guy with blond hair wearing glasses. Vincent is a guy with black hair wearing a hat.
Adrien and vincent want to start a new product, and they create it in one night before presenting it to the board.

Example output:

# Panel 1
description: 2 guys, a blond hair guy wearing glasses, a dark hair guy wearing hat, sitting at the office, with computers
text:
```
Vincent: I think Generative AI are the future of the company.
Adrien: Let's create a new product with it.
```
# end

Short Scenario:
{scenario}

Split the scenario in 6 parts:

"
"""


CHARACTER_DESCRIPTION_PROMPT = """

You are provided with a scenario and you have to describe the characters in the scenario.
The description MUST be precise and short.
The description MUST be only for the physical appearance of the characters.
Try to include descriptions of ALL the IMPORTANT characters in the scenario.
Example input:
Story: Adrien and Vincent work at the office and want to start a new product, and they create it in one night before presenting it to the board.

Example output:
Adrian: A tall guy with blonde hair wearing glasses.
Vincent: A short guy with black hair wearing a hat.

Short Scenario:
{scenario}

Description of Characters:
"""

IMAGE_PROMPT_REFINE = """
You are provided with a cartoon panel description and description of all the characters involved in the comic
Generate a a cartoon panel description using only the description of the characters involved in the panel.
DONOT add description of those characters that are not involved in the panel.

Example input:
Characters: Adrien is a guy with blond hair wearing glasses. Vincent is a guy with black hair wearing a hat.
Story: Adrien is sitting alone in his office, working on his computer.

Example output:
Adrien, a blonde hair guy wearing glasses, sitting at the office, working on his computer

Input: {characters_description}

Panel Description:
"""