def calculate_experience_score(resume_exp_list, jd_exp_expectation):
    """Calculate experience score based on quality, complexity, and relevance."""
    if not jd_exp_expectation:
        return 1.0
    
    total_relevant_years = 0
    complexity_multiplier = {"High": 1.2, "Medium": 1.0, "Low": 0.8}
    required_complexity = jd_exp_expectation.get("complexity_required", "Medium")
    
    for role in resume_exp_list:
        role_years = role.get("years", 0)
        role_complexity = role.get("complexity", "Medium")
        is_repetitive = role.get("is_repetitive", False)
        
        # Penalize repetitive work and reward complexity
        multiplier = complexity_multiplier.get(role_complexity, 1.0)
        if is_repetitive:
            multiplier *= 0.7
            
        # Relevance adjustment: if role complexity is higher than required, it counts more
        total_relevant_years += role_years * multiplier

    min_years_required = jd_exp_expectation.get("min_years", 0)
    if min_years_required <= 0:
        return 1.0
        
    return min(total_relevant_years / min_years_required, 1.0)

def calculate_skills_score(resume_skills, jd_required_skills):
    """Calculate skills score based on proficiency match."""
    if not jd_required_skills:
        return 1.0
        
    proficiency_map = {"Beginner": 1, "Intermediate": 2, "Expert": 3}
    total_possible_score = len(jd_required_skills) * 3 # Max proficiency is 3
    actual_score = 0
    
    resume_skills_dict = {s["name"].lower(): s for s in resume_skills}
    
    for req in jd_required_skills:
        skill_name = req["name"].lower()
        min_prof = proficiency_map.get(req.get("min_proficiency", "Intermediate"), 2)
        importance = {"High": 1.2, "Medium": 1.0, "Low": 0.8}.get(req.get("importance", "Medium"), 1.0)
        
        if skill_name in resume_skills_dict:
            actual_prof = proficiency_map.get(resume_skills_dict[skill_name].get("proficiency", "Beginner"), 1)
            # Proficiency match: if actual >= min, full score for this skill (weighted by importance)
            if actual_prof >= min_prof:
                actual_score += 3 * importance
            else:
                # Partial score if proficiency is lower
                actual_score += (actual_prof / min_prof) * 3 * importance
        # If missing, actual_score += 0
        
    # Normalize by total importance-weighted score
    weighted_total_possible = sum([3 * ({"High": 1.2, "Medium": 1.0, "Low": 0.8}.get(r.get("importance", "Medium"), 1.0)) for r in jd_required_skills])
    
    if weighted_total_possible == 0:
        return 1.0
        
    return min(actual_score / weighted_total_possible, 1.0)

def calculate_education_score(resume_edu, required_edu):
    """Calculate education score based on keyword matching."""
    if not required_edu:
        return 1.0
    
    # Common degree keywords and ranks
    ranks = {
        "phd": 4, "doctorate": 4,
        "master": 3, "msc": 3, "mba": 3, "mtech": 3,
        "bachelor": 2, "bsc": 2, "btech": 2,
        "diploma": 1,
        "high school": 0
    }
    
    resume_edu_low = (resume_edu or "").lower()
    required_edu_low = (required_edu or "").lower()
    
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
