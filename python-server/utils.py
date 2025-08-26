from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

models_dict = {
    "Groq": "openai/gpt-oss-20b"
}


def load_llm_model(name="Groq", model_id="openai/gpt-oss-20b"):
    load_dotenv()
    llm = None
    if name == "Groq":
        llm = ChatGroq(
            model=model_id,
            temperature=0.2,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
    else:
        raise ValueError(f"Model {name} not found.")
    if llm is None:
        raise ValueError(f"Model {name} not found.")
    return llm


def invoke_llm(llm, prompt, stop=None):
    return llm.invoke(prompt, stop=stop)






