import os
import json
import urllib.request
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def call_ollama(prompt: str, model: str = "mistral") -> dict:
    """Send prompt to local Ollama and return structured JSON as fallback."""
    url = "http://localhost:11434/api/generate"
    data = {
        "model": model, 
        "prompt": prompt, 
        "stream": False, 
        "format": "json"
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            return json.loads(result.get("response", "{}"))
    except Exception as e:
        return {"error": f"Ollama fallback error: {str(e)}"}

def call_groq(prompt: str, model: str = "llama-3.3-70b-versatile") -> dict:
    """Send prompt to Groq and return structured JSON."""
    if not client:
        return call_ollama(prompt)

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
        return call_ollama(prompt)

def extract_resume_data(text: str) -> dict:
    """Extract structured data from resume text with depth and context."""
    prompt = f"""
    Extract the following structured information from the resume text provided below.
    EXTRACT ONLY EXPLICITLY MENTIONED SKILLS AND DETAILS. DO NOT INFER OR ASSUME.

    Required fields:
    - skills: A list of explicitly mentioned professional skills (exclude vague terms).
    - tools: A list of explicitly mentioned technologies and tools.
    - experience: A concise textual summary of their core experiences and achievements.
    - education: A concise textual summary of their highest degree and education context.

    Return ONLY valid JSON format.
    Example Format:
    {{
        "skills": ["JavaScript", "Data Analysis"],
        "tools": ["Jupyter", "Docker"],
        "experience": "Worked as Data Analyst for 3 years processing large datasets...",
        "education": "Master of Science in Computer Science from XYZ University"
    }}
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
    return call_groq(prompt, model="llama-3.3-70b-versatile")

def extract_jd_data(text: str) -> dict:
    """Extract structured data from Job Description with requirement depth."""
    prompt = f"""
    Extract the following structured information from the Job Description (JD) text provided below.

    Required fields:
    - domain: The broad field/industry of the role (e.g. "Data Science", "Civil Engineering", "Marketing").
    - skills: A list of required professional skills.
    - tools: A list of required technologies and tools.
    - responsibilities: A textual summary of the job responsibilities and duties.
    - requirements: A textual summary of the general requirements, including education and experience needed.
    - critical_skills: A list of the absolute MUST-HAVE skills and tools explicitly emphasized.

    Return ONLY valid JSON format.
    Example Format:
    {{
        "domain": "Data Science",
        "skills": ["Machine Learning", "Statistics"],
        "tools": ["Python", "TensorFlow"],
        "responsibilities": "Develop predictive models and present findings to stakeholders...",
        "requirements": "Minimum 3 years experience, Master's degree preferred...",
        "critical_skills": ["Machine Learning", "Python"]
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
    return call_groq(prompt, model="llama-3.3-70b-versatile")
