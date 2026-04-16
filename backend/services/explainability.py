from .groq_client import call_groq

def generate_explanation(resume_data: dict, jd_data: dict, scores: dict) -> dict:
    """Generate a conversational, human-like critique and reasoning."""
    
    prompt = f"""
    As an expert technical recruiter, provide a conversational and honest critique of this candidate for the following role.
    
    Role: {jd_data.get('role_title', 'The provided position')}
    Candidate Match Scores: {scores}
    
    Candidate Skill Depth Evidence: {resume_data.get('skills', [])}
    Candidate Experience Quality: {resume_data.get('experience', [])}
    
    Requirement Complexity: {jd_data.get('experience_expectation', {})}
    Required Skills Importance: {jd_data.get('required_skills', [])}

    Return a JSON object with:
    1. "critique": A 2-3 sentence conversational summary of the candidate's fit.
    2. "skill_reasoning": Explain why the skills score was given, citing specific evidence or gaps.
    3. "experience_reasoning": Explain why the experience score was given, focusing on quality/repetitiveness vs growth.
    4. " recruiter_verdict": A final "human" take on whether they are worth interviewing.
    
    Example:
    {{
        "critique": "John shows strong growth in React, but his experience with backend scaling seems a bit repetitive.",
        "skill_reasoning": "While he has 3 years of Python, he lacks evidence of working with distributed systems as required.",
        "experience_reasoning": "Solid 5 years, but the last 2 years at X Corp seem to be maintenance work without much new complexity.",
        "recruiter_verdict": "Waitlist - Strong skills but check for passion in new challenges."
    }}
    """
    
    explanation_data = call_groq(prompt)
    
    # Fallback to structured data if LLM fails
    if "error" in explanation_data:
        return {
            "critique": "System error generating critique.",
            "skill_reasoning": f"Score: {scores.get('skills')}",
            "experience_reasoning": f"Score: {scores.get('experience')}",
            "recruiter_verdict": "Pending review."
        }
        
    return explanation_data
