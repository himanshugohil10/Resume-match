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
    """Extract structured data from resume text with depth and context."""
    prompt = f"""
    Analyze the following resume and extract detailed information focusing on skill depth, project impact, and experience quality.
    
    Return ONLY valid JSON with this structure:
    {{
        "candidate_info": {{
            "name": "Extract if available, else 'Unknown'",
            "education": "Highest degree and institution"
        }},
        "skills": [
            {{
                "name": "Skill Name",
                "proficiency": "Beginner|Intermediate|Expert",
                "evidence": "Brief mention of project or role where this was used",
                "context": "How long and in what capacity"
            }}
        ],
        "experience": [
            {{
                "role": "Job Title",
                "years": 1.5,
                "complexity": "Low|Medium|High",
                "impact": "Brief description of achievements or growth",
                "is_repetitive": false
            }}
        ],
        "total_experience_years": 5.0,
        "tools": ["Tool1", "Tool2"]
    }}

    Rules:
    - 'complexity' should be judged by responsibilities and scope.
    - 'is_repetitive' is true if the role involves doing the same tasks as previous roles without growth.
    - 'proficiency' should be derived from the description of work, not just presence of the word.

    Resume Text:
    {text}
    """
    return call_groq(prompt)

def extract_jd_data(text: str) -> dict:
    """Extract structured data from Job Description with requirement depth."""
    prompt = f"""
    Analyze the following Job Description (JD) and extract core requirements and expectations.
    
    Return ONLY valid JSON with this structure:
    {{
        "role_title": "Title",
        "required_skills": [
            {{
                "name": "Skill Name",
                "min_proficiency": "Beginner|Intermediate|Expert",
                "importance": "High|Medium|Low"
            }}
        ],
        "experience_expectation": {{
            "min_years": 3,
            "complexity_required": "Low|Medium|High",
            "key_responsibilities": ["Task1", "Task2"]
        }},
        "required_tools": ["Tool1", "Tool2"],
        "education_requirement": "Bachelor's Degree"
    }}

    JD Text:
    {text}
    """
    return call_groq(prompt)
