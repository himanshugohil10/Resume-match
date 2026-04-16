from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

from services.parser import extract_text
from services.groq_client import extract_resume_data, extract_jd_data
from services.embedding import get_semantic_match_score
from services.scoring import calculate_experience_score, calculate_education_score, calculate_skills_score, get_final_score
from services.explainability import generate_explanation

app = FastAPI(title="Explainable Resume Ranking System")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Resume Ranking API is running."}

@app.post("/evaluate")
async def evaluate(
    jd_text: str = Form(...),
    files: List[UploadFile] = File(...),
    weights: str = Form(...) # JSON string of weights
):
    try:
        parsed_weights = json.loads(weights)
    except Exception:
        parsed_weights = {"skills": 0.4, "experience": 0.3, "education": 0.1, "tools": 0.2}

    # 1. Process JD
    jd_data = extract_jd_data(jd_text)
    if "error" in jd_data:
        raise HTTPException(status_code=500, detail=f"JD Extraction Error: {jd_data['error']}")

    results = []

    # 2. Process each resume
    for file in files:
        file_bytes = await file.read()
        try:
            resume_text = extract_text(file_bytes, file.filename)
        except Exception as e:
            continue # Skip files that can't be parsed

        resume_data = extract_resume_data(resume_text)
        if "error" in resume_data:
            continue # Skip if extraction fails

        # 3. Calculate Section Scores
        skills_score = calculate_skills_score(resume_data.get("skills", []), jd_data.get("required_skills", []))
        tools_score = get_semantic_match_score(jd_data.get("required_tools", []), resume_data.get("tools", []))
        exp_score = calculate_experience_score(resume_data.get("experience", []), jd_data.get("experience_expectation", {}))
        edu_score = calculate_education_score(resume_data.get("candidate_info", {}).get("education", ""), jd_data.get("education_requirement", ""))

        scores = {
            "skills": skills_score,
            "tools": tools_score,
            "experience": exp_score,
            "education": edu_score
        }

        # 4. Final Weighted Score
        final_score = get_final_score(scores, parsed_weights)

        # 5. Generate Explanation
        explanation = generate_explanation(resume_data, jd_data, scores)

        results.append({
            "candidate_name": resume_data.get("candidate_info", {}).get("name", file.filename),
            "final_score": final_score,
            "scores": scores,
            "explanation": explanation,
            "resume_data": resume_data # Pass detailed data to frontend
        })

    # Sort results by final score descending
    ranked_results = sorted(results, key=lambda x: x["final_score"], reverse=True)

    return {
        "jd_structured": jd_data,
        "rankings": ranked_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
