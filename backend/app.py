import os
import io
import json
import re
import requests
import asyncio
import aiohttp
from hashlib import sha1
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
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY") or "6e51c178fcmsh2fffd5953e0a575p18fcd9jsn01f40527a566"
MAX_JOBS_PER_SOURCE = 6
MAX_SEARCH_QUERIES = 3
MAX_TOTAL_RESULTS = 18
RAPIDAPI_TIMEOUT_SECONDS = 20


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

def sanitize_job_id(source, raw_id, title, company, location):
    base_id = str(raw_id).strip()
    if not base_id:
        digest = sha1(f"{title}|{company}|{location}".encode("utf-8")).hexdigest()[:16]
        base_id = digest

    safe_id = re.sub(r'[^a-zA-Z0-9._-]+', '-', base_id).strip('-') or "job"
    return f"{source.lower()}-{safe_id}"

def normalize_location(*parts):
    return ", ".join([part for part in parts if part]).strip() or "Location not specified"

def normalize_employment_type(value):
    if not value:
        return "Unknown"

    normalized = str(value).replace("_", " ").replace("-", " ").strip().lower()
    mapping = {
        "fulltime": "Full-time",
        "full time": "Full-time",
        "parttime": "Part-time",
        "part time": "Part-time",
        "contract": "Contract",
        "contractor": "Contract",
        "intern": "Internship",
        "internship": "Internship"
    }
    return mapping.get(normalized, str(value).title())

def normalize_remote_option(location, is_remote=False):
    location_text = str(location or "").lower()
    if is_remote or "remote" in location_text:
        return "Remote"
    if "hybrid" in location_text:
        return "Hybrid"
    return "On-site"

def deduplicate_jobs(jobs):
    seen = set()
    unique_jobs = []

    for job in jobs:
        fingerprint = (
            (job.get("apply_url") or "").strip().lower(),
            (job.get("title") or "").strip().lower(),
            (job.get("company") or "").strip().lower(),
            (job.get("location") or "").strip().lower(),
        )
        if fingerprint in seen:
            continue
        seen.add(fingerprint)
        unique_jobs.append(job)

    return unique_jobs

def generate_search_queries(cv_data):
    role = (cv_data.get("primary_role") or "").strip()
    location = (cv_data.get("location") or "").strip()
    skills = [str(skill).strip() for skill in cv_data.get("skills", []) if str(skill).strip()]
    queries = []

    if role:
        queries.append(role)

    if role and skills:
        queries.append(f"{role} {' '.join(skills[:2])}")

    if role and location and location.lower() not in {"remote/not specified", "not specified"}:
        queries.append(f"{role} {location}")

    if skills:
        queries.append(f"{skills[0]} developer")

    unique_queries = []
    seen = set()
    for query in queries:
        normalized_query = " ".join(query.split())
        if not normalized_query:
            continue
        lowered = normalized_query.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        unique_queries.append(normalized_query)

    return unique_queries[:MAX_SEARCH_QUERIES] or ["Software Engineer"]

async def fetch_global_jobs(session, keywords, page, rapidapi_key):
    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {
        "query": keywords,
        "page": str(page),
        "num_pages": "1",
        "country": "us"
    }
    headers = {"x-rapidapi-key": rapidapi_key, "x-rapidapi-host": "jsearch.p.rapidapi.com"}
    try:
        async with session.get(
            url,
            headers=headers,
            params=querystring,
            timeout=aiohttp.ClientTimeout(total=RAPIDAPI_TIMEOUT_SECONDS)
        ) as response:
            if response.status == 200:
                data = await response.json()
                job_list = data.get("data")
                if not isinstance(job_list, list):
                    job_list = []
                
                return [{
                    "id": sanitize_job_id(
                        "jsearch",
                        job.get("job_id"),
                        job.get("job_title", ""),
                        job.get("employer_name", ""),
                        normalize_location(job.get("job_city", ""), job.get("job_state", ""))
                    ),
                    "title": job.get("job_title", "Unknown"),
                    "company": job.get("employer_name", "Unknown"),
                    "location": normalize_location(job.get('job_city', ''), job.get('job_state', '')),
                    "source": "JSearch",
                    "apply_url": job.get("job_apply_link", ""),
                    "description": job.get("job_description", ""),
                    "date_posted": job.get("job_posted_human_readable", ""),
                    "query_used": keywords,
                    "type": normalize_employment_type(
                        job.get("job_employment_type_text") or job.get("job_employment_type")
                    ),
                    "remote_option": normalize_remote_option(
                        job.get("job_location") or job.get("job_city"), job.get("job_is_remote", False)
                    )
                } for job in list(job_list)[:MAX_JOBS_PER_SOURCE]]
            print(f"JSearch non-200 response: {response.status}")
    except Exception as e:
        print(f"JSearch Error: {repr(e)}")
    return []

async def fetch_linkedin_jobs(session, keywords, page, rapidapi_key):
    url = "https://linkedin-api8.p.rapidapi.com/search-jobs-v2"
    querystring = {"keywords": keywords, "locationId": "92000000", "datePosted": "anyTime", "sort": "mostRelevant", "start": str((page - 1) * 10)}
    headers = {"x-rapidapi-key": rapidapi_key, "x-rapidapi-host": "linkedin-api8.p.rapidapi.com", "Content-Type": "application/json"}
    try:
        async with session.get(
            url,
            headers=headers,
            params=querystring,
            timeout=aiohttp.ClientTimeout(total=RAPIDAPI_TIMEOUT_SECONDS)
        ) as response:
            if response.status == 200:
                data = await response.json()
                job_list = data.get("data")
                if not isinstance(job_list, list):
                    job_list = []
                
                return [{
                    "id": sanitize_job_id(
                        "linkedin",
                        job.get("id"),
                        job.get("title", ""),
                        (job.get("company") or {}).get("name", ""),
                        job.get("location", "")
                    ),
                    "title": job.get("title", "Unknown"),
                    "company": (job.get("company") or {}).get("name", "Unknown"),
                    "location": job.get("location", "Location not specified"),
                    "source": "LinkedIn",
                    "apply_url": job.get("url", ""),
                    "description": job.get("description") or "", 
                    "date_posted": job.get("postDate", ""),
                    "query_used": keywords,
                    "type": normalize_employment_type(job.get("employmentType")),
                    "remote_option": normalize_remote_option(job.get("location"), job.get("isRemote", False))
                } for job in list(job_list)[:MAX_JOBS_PER_SOURCE]]
            print(f"LinkedIn non-200 response: {response.status}")
    except Exception as e:
        print(f"LinkedIn Error: {repr(e)}")
    return []

async def fetch_indeed_jobs(session, keywords, page, rapidapi_key):
    url = "https://indeed12.p.rapidapi.com/jobs/search"
    querystring = {"query": keywords, "page_id": str(page)}
    headers = {"x-rapidapi-key": rapidapi_key, "x-rapidapi-host": "indeed12.p.rapidapi.com"}
    try:
        async with session.get(
            url,
            headers=headers,
            params=querystring,
            timeout=aiohttp.ClientTimeout(total=RAPIDAPI_TIMEOUT_SECONDS)
        ) as response:
            if response.status == 200:
                data = await response.json()
                job_list = data.get("hits")
                if not isinstance(job_list, list):
                    job_list = []
                
                return [{
                    "id": sanitize_job_id(
                        "indeed",
                        job.get("id"),
                        job.get("title", ""),
                        job.get("company_name", ""),
                        job.get("location", "")
                    ),
                    "title": job.get("title", "Unknown"),
                    "company": job.get("company_name", "Unknown"),
                    "location": job.get("location", "Location not specified"),
                    "source": "Indeed",
                    "apply_url": "https://indeed.com" + job.get("link", "") if job.get("link") else "",
                    "description": job.get("description") or job.get("snippet") or "",
                    "date_posted": job.get("formatted_relative_time", ""),
                    "query_used": keywords,
                    "type": normalize_employment_type(job.get("job_type") or job.get("employment_type")),
                    "remote_option": normalize_remote_option(job.get("location"))
                } for job in list(job_list)[:MAX_JOBS_PER_SOURCE]]
            print(f"Indeed non-200 response: {response.status}")
    except Exception as e:
        print(f"Indeed Error: {repr(e)}")
    return []

async def fetch_all_jobs(search_queries, page=1):
    if not RAPIDAPI_KEY or RAPIDAPI_KEY == "placeholder":
        print("WARNING: Using mock jobs because RAPIDAPI_KEY is missing/invalid.")
        return get_mock_jobs()
    
    queries = search_queries if isinstance(search_queries, list) else [search_queries]
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for keywords in queries[:MAX_SEARCH_QUERIES]:
            tasks.extend([
                asyncio.create_task(fetch_global_jobs(session, keywords, page, RAPIDAPI_KEY)),
                asyncio.create_task(fetch_linkedin_jobs(session, keywords, page, RAPIDAPI_KEY)),
                asyncio.create_task(fetch_indeed_jobs(session, keywords, page, RAPIDAPI_KEY))
            ])
        results = await asyncio.gather(*tasks, return_exceptions=True)
        jobs = [job for sublist in results if isinstance(sublist, list) for job in sublist]
        
        if not jobs:
            print("WARNING: All RapidAPIs returned 0 jobs, falling back to mock jobs.")
            return get_mock_jobs()
            
        return deduplicate_jobs(jobs)[:MAX_TOTAL_RESULTS]

def get_mock_jobs():
    """Fallback if API fails."""
    return [
        {
            "id": "mock-1",
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "Remote",
            "source": "Mock API",
            "apply_url": "https://example.com/apply",
            "description": "Looking for a Software Engineer with Python and React experience. Must know Git and Docker.",
            "date_posted": "just now",
            "query_used": "mocked query",
            "type": "Full-time",
            "remote_option": "Remote",
            "skills": [],
            "matchScore": 0
        }
    ]

def calculate_match(cv_data, job):
    cv_skills = [s.lower() for s in cv_data.get("skills", [])]
    cv_role = cv_data.get("primary_role", "").lower()
    
    desc_lower = job.get("description", "").lower()
    
    common_techs = ["python", "react", "node", "javascript", "typescript", "java", "c++", "golang", "docker", "kubernetes", "aws", "sql", "nosql", "git", "linux", "html", "css", "vue", "angular", "django", "flask"]
    job_required_skills = [tech for tech in common_techs if tech in desc_lower]
    
    if not job_required_skills:
        job_required_skills = ["communication", "teamwork"] 
        
    job["skills"] = []
    
    matched_count: int = 0
    for req_skill in job_required_skills:
        is_matched = any(req_skill in user_skill.lower() for user_skill in cv_skills)
        if is_matched:
            matched_count += 1
            job["skills"].append({"name": req_skill.title(), "required": True, "status": "matched"})
        else:
            job["skills"].append({
                "name": req_skill.title(), 
                "required": True, 
                "status": "missing",
                "improvementTip": f"Consider adding a project involving {req_skill.title()}."
            })
            
    skill_score = (int(matched_count) / len(job_required_skills)) * 40 if job_required_skills else 40
    title_score = 15 if any(word in job.get("title", "").lower() for word in cv_role.split()) else 5
    exp_score = 25 
    loc_score = 15 if "remote" in job.get("remote_option", "").lower() or "remote" in job.get("location", "").lower() else 5
    
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
        search_queries = generate_search_queries(structured_data)
        print("Fetching jobs from RapidAPI using queries:", search_queries)
        # We also support a 'page' argument from args if available
        page = request.args.get('page', 1, type=int)
        
        # In a Flask sync route, to call an async function properly:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        jobs = loop.run_until_complete(fetch_all_jobs(search_queries, page))
        loop.close()
        
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
            "matches": matched_jobs,
            "search_query": search_queries[0],
            "search_queries": search_queries
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
