import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Test basic Groq API functionality
response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {"role": "user", "content": "Generate a brief description of a superhero character for a comic book."}
    ],
    temperature=0.2,
    max_tokens=150
)

print("Groq API Test Response:")
print(response.choices[0].message.content)