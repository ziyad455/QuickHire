import os
import io
import json
import re
import requests
import pdfplumber
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

load_dotenv()

app = Flask(__name__)
# Allow CORS for local dev
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Extractors ---

def extract_text_from_pdf(file_stream):
    text = ""
    with pdfplumber.open(file_stream) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text

def extract_text_from_docx(file_stream):
    doc = Document(file_stream)
    return "\n".join([para.text for para in doc.paragraphs])

# --- LLM Setup ---

hf_api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

if not hf_api_token or hf_api_token == "placeholder":
    print("WARNING: HUGGINGFACEHUB_API_TOKEN is not set correctly in .env!")

hf_model = "meta-llama/Llama-3.3-70B-Instruct"

endpoint = HuggingFaceEndpoint(
    repo_id=hf_model,
    max_new_tokens=1024,
    huggingfacehub_api_token=hf_api_token,
    temperature=0.1
)

hf_llm = ChatHuggingFace(llm=endpoint)

# RapidAPI Setup
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

# --- Prompts ---

parse_cv_prompt = PromptTemplate(
    input_variables=["cv_text"],
    template="""You are an expert HR AI tasked with analyzing a CV and extracting specific structured data.
You MUST extract the data exactly in the JSON format requested. Do not include any explanations, markdown formatting, or introductory text. Just valid JSON.

Extract the following information:
1. "candidate_name": The full name of the person.
2. "primary_role": The main job title or profession this person is aiming for (e.g., "Software Engineer", "Frontend Developer", "Data Scientist"). Infer this from their summary, most recent title, or skills.
3. "years_of_experience": A rough integer estimate of total professional years (e.g., 3, 5, 0).
4. "skills": A flat array of strings containing all technical skills, programming languages, tools, and methodologies mentioned. (e.g. ["React", "Python", "Agile"]).
5. "location": The candidate's listed city or country, or "Remote/Not Specified" if absent.

Return ONLY a valid JSON object matching this structure:
{{
  "candidate_name": "String",
  "primary_role": "String",
  "years_of_experience": Number,
  "skills": ["String"],
  "location": "String"
}}

CV Content:
{cv_text}"""
)

parse_cv_chain = parse_cv_prompt | hf_llm

tips_prompt = PromptTemplate(
    input_variables=["role", "missing_skill"],
    template="""You are a career coaching AI. A candidate for a {role} role is missing the skill: "{missing_skill}".
Provide a VERY brief, 1-2 sentence actionable tip on how they can bridge this gap or what they should add to their CV (e.g., "Add a side project using X", "Rephrase Y to highlight X experience"). Keep it encouraging but concise."""
)
tips_chain = tips_prompt | hf_llm

# --- Services ---

def fetch_jobs_from_rapidapi(keywords):
    """Fetch jobs using the Active Jobs Search API (LinkedIn)."""
    if not RAPIDAPI_KEY or RAPIDAPI_KEY == "placeholder":
        print("WARNING: Using mock jobs because RAPIDAPI_KEY is missing or invalid.")
        return get_mock_jobs()

    url = "https://linkedin-data-api.p.rapidapi.com/search-jobs-v2"
    querystring = {
        "keywords": keywords,
        "locationId": "92000000", # Default global/remote or use a specific ID if known
        "datePosted": "anyTime",
        "sort": "mostRelevant"
    }
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # The API returns an array in "data" or similar depending on the exact endpoint variant.
        # Handling the standard list response from linkedin-data-api:
        jobs_data = data.get("data", []) if isinstance(data, dict) else data
        
        normalized_jobs = []
        for job in jobs_data[:10]: # Limit to top 10 for performance of matching
            # Extract skills if they are present in the summary or we'll simulate extraction
            desc = job.get("description", "") or job.get("summary", "")
            if not desc:
                continue
                
            # Naive skill extraction for the job (in a real app, we'd use LLM here too, 
            # but for speed we'll do basic keyword matching or assume required skills)
            
            normalized_jobs.append({
                "id": str(job.get("id", "")),
                "title": job.get("title", "Unknown Title"),
                "company": job.get("company", {}).get("name") if isinstance(job.get("company"), dict) else job.get("company", "Unknown Company"),
                "location": job.get("location", "Remote"),
                "type": job.get("type", "Full-time"),
                "remoteOption": "Remote" if "remote" in str(job.get("location", "")).lower() else "On-site",
                "description": desc,
                "applyUrl": job.get("url", ""),
                # To be populated by match engine:
                "skills": [], 
                "matchScore": 0
            })
            
        return normalized_jobs
    except Exception as e:
        print(f"RapidAPI Error: {e}")
        return get_mock_jobs()

def get_mock_jobs():
    """Fallback if API fails."""
    return [
        {
            "id": "mock-1",
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "Remote",
            "type": "Full-time",
            "remoteOption": "Remote",
            "description": "Looking for a Software Engineer with Python and React experience. Must know Git and Docker.",
            "skills": [],
            "matchScore": 0
        }
    ]

def calculate_match(cv_data, job):
    """
    Compare CV JSON vs Job JSON.
    Score factors: 40% Skills, 30% Experience, 15% Location, 15% Title similarity (Simulated simple matching)
    """
    cv_skills = [s.lower() for s in cv_data.get("skills", [])]
    cv_role = cv_data.get("primary_role", "").lower()
    
    desc_lower = job["description"].lower()
    
    # 1. Very basic inline skill extraction from job description based on common tech words
    # Doing this in-memory instead of LLM to save time per-job.
    common_techs = ["python", "react", "node", "javascript", "typescript", "java", "c++", "golang", "docker", "kubernetes", "aws", "sql", "nosql", "git", "linux", "html", "css", "vue", "angular", "django", "flask"]
    job_required_skills = [tech for tech in common_techs if tech in desc_lower]
    
    # Ensure there's at least one skill to match against
    if not job_required_skills:
        job_required_skills = ["communication", "teamwork"] 
        
    job["skills"] = []
    
    # Skills Math (40%)
    matched_count = 0
    for req_skill in job_required_skills:
        # Check if required skill is in user's skills
        is_matched = any(req_skill in user_skill.lower() for user_skill in cv_skills)
        if is_matched:
            matched_count += 1
            job["skills"].append({"name": req_skill.title(), "required": True, "status": "matched"})
        else:
            # Generate tip dynamically via LLM for missing skills
            try:
                tip_response = tips_chain.invoke({"role": cv_role, "missing_skill": req_skill.title()})
                tip = tip_response.content if hasattr(tip_response, 'content') else str(tip_response)
            except:
                tip = f"Consider adding a project involving {req_skill.title()} to your resume."
                
            job["skills"].append({
                "name": req_skill.title(), 
                "required": True, 
                "status": "missing",
                "improvementTip": tip.strip()
            })
            
    skill_score = (matched_count / len(job_required_skills)) * 40 if job_required_skills else 40
    
    # Title Math (15%) - simple naive check
    title_score = 15 if any(word in job["title"].lower() for word in cv_role.split()) else 5
    
    # Experience (30%) - assume OK for now
    exp_score = 25 
    
    # Location (15%)
    loc_score = 15 if "remote" in job["remoteOption"].lower() or "remote" in job["location"].lower() else 5
    
    total_score = int(skill_score + title_score + exp_score + loc_score)
    job["matchScore"] = min(total_score, 100)
    
    return job

# --- Routes ---

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "QuickHire AI Backend is running"})

@app.route('/analyze-cv', methods=['POST'])
def analyze_cv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = file.filename.lower()
    file_stream = io.BytesIO(file.read())
    
    try:
        # 1. In-memory extraction
        if filename.endswith('.pdf'):
            cv_text = extract_text_from_pdf(file_stream)
        elif filename.endswith('.docx'):
            cv_text = extract_text_from_docx(file_stream)
        else:
            return jsonify({"error": "Unsupported file format. Use PDF or DOCX."}), 400
        
        if not cv_text.strip():
            return jsonify({"error": "Could not extract text from the file."}), 400

        # 2. AI Structuring
        print(f"Extracting structured data via LLM for {filename}...")
        response = parse_cv_chain.invoke({"cv_text": cv_text[:10000]}) # Limit text length just in case
        
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Super aggressive JSON extraction in case the model wraps it in backticks
        json_match = re.search(r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}', content, re.DOTALL)
        
        if not json_match:
             raise ValueError("LLM failed to return a valid JSON structure.")
             
        structured_data = json.loads(json_match.group(0))

        # 3. Job Fetching
        print("Fetching jobs from RapidAPI based on role:", structured_data.get("primary_role"))
        jobs = fetch_jobs_from_rapidapi(structured_data.get("primary_role", "Software Engineer"))
        
        # 4. Matching Engine & Gap Analysis
        print(f"Calculating match scores for {len(jobs)} jobs...")
        matched_jobs = []
        for job in jobs:
            scored_job = calculate_match(structured_data, job)
            matched_jobs.append(scored_job)
            
        # Sort by best match (descending)
        matched_jobs.sort(key=lambda x: x["matchScore"], reverse=True)
        
        return jsonify({
            "status": "success",
            "candidate": structured_data,
            "matches": matched_jobs
        })

    except json.JSONDecodeError as j_err:
        print(f"JSON Parse Error: {j_err} on content {content}")
        return jsonify({"error": "Failed to parse AI output into JSON."}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5555, debug=True)
