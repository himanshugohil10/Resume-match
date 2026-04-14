import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def call_groq(prompt: str, model: str = "llama-3.3-70b-versatile") -> dict:
    """Send prompt to Groq and return structured JSON."""
    if not client:
        return {"error": "Groq API key not configured."}

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=model,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        response_content = chat_completion.choices[0].message.content
        return json.loads(response_content)
    except Exception as e:
        return {"error": str(e)}

def extract_resume_data(text: str) -> dict:
    """Extract structured data from resume text."""
    prompt = f"""
    Extract the following structured information from the resume text provided below:
    - skills: A list of professional skills.
    - experience_years: A single number representing total years of experience.
    - education: The highest degree mentioned.
    - tools: A list of technologies and tools mentioned.

    Return ONLY valid JSON.
    Example Format:
    {{
        "skills": ["Python", "Machine Learning"],
        "experience_years": 5,
        "education": "Master of Science in Computer Science",
        "tools": ["Docker", "Git", "PyTorch"]
    }}

    Resume Text:
    {text}
    """
    return call_groq(prompt)

def extract_jd_data(text: str) -> dict:
    """Extract structured data from Job Description text."""
    prompt = f"""
    Extract the following structured information from the Job Description (JD) text provided below:
    - skills: A list of required professional skills.
    - experience_years: A single number representing minimum required years of experience.
    - education: Minimum education requirement.
    - tools: A list of required technologies and tools.

    Return ONLY valid JSON.
    Example Format:
    {{
        "skills": ["React", "FastAPI"],
        "experience_years": 3,
        "education": "Bachelor's Degree",
        "tools": ["AWS", "PostgreSQL"]
    }}

    JD Text:
    {text}
    """
    return call_groq(prompt)
