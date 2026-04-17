# A straightforward ontology categorizing explicit skills and tools.
# This prevents LLMs from hallucinating generic terms like "projects" or "management" as hard skills.

ONTOLOGY = {
    "data_science": [
        "machine learning", "statistics", "pandas", "numpy", "deep learning", 
        "nlp", "artificial intelligence", "data analysis", "data mining", 
        "scikit-learn", "computer vision", "predictive modeling"
    ],
    "programming": [
        "python", "java", "c++", "javascript", "typescript", "c#", "go", "ruby", 
        "swift", "kotlin", "rust", "php", "c", "r", "matlab", "scala"
    ],
    "tools": [
        "tensorflow", "pytorch", "sql", "tableau", "docker", "kubernetes", 
        "aws", "gcp", "azure", "git", "github", "gitlab", "jira", "confluence",
        "power bi", "excel", "spark", "hadoop", "kafka"
    ],
    "civil_engineering": [
        "autocad", "structural analysis", "surveying", "revit", 
        "construction management", "civil 3d", "etabs", "staad pro", "geotechnical"
    ],
    "web_development": [
        "react", "node.js", "html", "css", "vue", "angular", "fastapi", "django", 
        "express", "flask", "springboot", "next.js", "graphql", "rest api"
    ],
    "devops": [
        "ci/cd", "jenkins", "terraform", "ansible", "linux", "bash", "shell scripting",
        "prometheus", "grafana", "nginx"
    ]
}

def get_valid_ontology_terms() -> set:
    """Flatten ontology to a single set of valid lowercased terms for quick lookup."""
    valid_terms = set()
    for items in ONTOLOGY.values():
        for item in items:
            valid_terms.add(item.lower())
    return valid_terms

VALID_TERMS = get_valid_ontology_terms()

def normalize_skills(extracted_items: list) -> list:
    """
    Normalize extracted items (skills/tools) against the ontology.
    Ignores vague terms. Returns a unique list of valid skills.
    """
    if not extracted_items:
        return []
        
    normalized = []
    
    for item in extracted_items:
        # Standardize strings
        item_lower = str(item).lower().strip()
        
        # Exact match
        if item_lower in VALID_TERMS:
            normalized.append(item_lower)
            continue
            
        # Partial containment logic: 'python programming' -> 'python'
        # if the strict requirement implies exactly matching or mapping:
        for valid in VALID_TERMS:
            if valid in item_lower or item_lower in valid:
                normalized.append(valid)
                break
            
    # Remove duplicates
    return list(set(normalized))
