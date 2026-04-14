def generate_explanation(resume_data: dict, jd_data: dict, scores: dict) -> dict:
    """Generate a detailed breakdown of the candidate's scores."""
    
    # Find matched and missing skills
    resume_skills = set([s.lower() for s in resume_data.get("skills", [])])
    jd_skills = set([s.lower() for s in jd_data.get("skills", [])])
    
    matched_skills = list(jd_skills.intersection(resume_skills))
    missing_skills = list(jd_skills - resume_skills)
    
    # Find matched and missing tools
    resume_tools = set([t.lower() for t in resume_data.get("tools", [])])
    jd_tools = set([t.lower() for t in jd_data.get("tools", [])])
    
    matched_tools = list(jd_tools.intersection(resume_tools))
    missing_tools = list(jd_tools - resume_tools)
    
    explanation = {
        "skills": {
            "score": round(scores.get("skills", 0), 2),
            "matched": matched_skills,
            "missing": missing_skills
        },
        "experience": {
            "score": round(scores.get("experience", 0), 2),
            "required": jd_data.get("experience_years", 0),
            "actual": resume_data.get("experience_years", 0)
        },
        "education": {
            "score": round(scores.get("education", 0), 2),
            "required": jd_data.get("education", ""),
            "actual": resume_data.get("education", "")
        },
        "tools": {
            "score": round(scores.get("tools", 0), 2),
            "matched": matched_tools,
            "missing": missing_tools
        }
    }
    
    return explanation
