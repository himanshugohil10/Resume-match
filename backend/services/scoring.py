from .embedding import get_semantic_match_score
import re

def calculate_experience_score(resume_exp, required_exp):
    resume_exp = resume_exp or 0
    required_exp = required_exp or 0

    if required_exp <= 0:
        return 1.0
    
    return min(resume_exp / required_exp, 1.0)

def calculate_education_score(resume_edu, required_edu):
    """Calculate education score based on keyword matching."""
    if not required_edu:
        return 1.0
    
    # Common degree keywords
    keywords = ["phd", "doctorate", "master", "msc", "mba", "bachelor", "bsc", "btech", "mtech"]
    
    resume_edu_low = (resume_edu or "").lower()
    required_edu_low = (required_edu or "").lower()
    
    # Check if the highest degree matches or exceeds
    # Simplified logic: if JD mentions 'Master' and resume has 'Master' or 'PhD', it's a match
    # Higher rank matches lower rank requirement
    ranks = {
        "phd": 4, "doctorate": 4,
        "master": 3, "msc": 3, "mba": 3, "mtech": 3,
        "bachelor": 2, "bsc": 2, "btech": 2,
        "diploma": 1,
        "high school": 0
    }
    
    jd_rank = 0
    for k, v in ranks.items():
        if k in required_edu_low:
            jd_rank = max(jd_rank, v)
            
    resume_rank = 0
    for k, v in ranks.items():
        if k in resume_edu_low:
            resume_rank = max(resume_rank, v)
            
    if resume_rank >= jd_rank:
        return 1.0
    elif jd_rank > 0:
        return resume_rank / jd_rank
    return 1.0

def get_final_score(scores: dict, weights: dict) -> float:
    """Calculate final weighted score."""
    final_score = (
        (scores.get("skills", 0) * weights.get("skills", 0.4)) +
        (scores.get("experience", 0) * weights.get("experience", 0.3)) +
        (scores.get("education", 0) * weights.get("education", 0.1)) +
        (scores.get("tools", 0) * weights.get("tools", 0.2))
    )
    return round(final_score, 2)
