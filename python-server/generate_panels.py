import re
import json
from langchain_groq import ChatGroq
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from dotenv import load_dotenv
import os

from prompts import CONTENT_GENERATION_PROMPT

load_dotenv()


def generate_panels(scenario):
    model = ChatGroq(
        model="openai/gpt-oss-20b",
        temperature=0.2,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )

    human_message_prompt = HumanMessagePromptTemplate.from_template(CONTENT_GENERATION_PROMPT)

    chat_prompt = ChatPromptTemplate.from_messages([human_message_prompt])

    chat_prompt.format_messages(scenario=scenario)

    result = model.invoke(chat_prompt.format_messages(scenario=scenario))

    print(result.content)

    return extract_panel_info(result.content)


def extract_panel_info(text):
    panel_info_list = []
    panel_blocks = text.split('# Panel')

    for block in panel_blocks:
        if block.strip() != '':
            panel_info = {}

            # Extracting panel number
            panel_number = re.search(r'\d+', block)
            if panel_number is not None:
                panel_info['number'] = panel_number.group()

            # Extracting panel description
            panel_description = re.search(r'description: (.+)', block)
            if panel_description is not None:
                panel_info['description'] = panel_description.group(1)

            # Extracting panel text
            panel_text = re.search(r'text:\n```\n(.+)\n```', block, re.DOTALL)
            if panel_text is not None:
                panel_info['text'] = panel_text.group(1)

            panel_info_list.append(panel_info)
    return panel_info_list
