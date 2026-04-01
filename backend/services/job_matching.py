import re

COMMON_TECHS = [
    "python",
    "react",
    "node",
    "javascript",
    "typescript",
    "java",
    "c++",
    "golang",
    "docker",
    "kubernetes",
    "aws",
    "sql",
    "nosql",
    "git",
    "linux",
    "html",
    "css",
    "vue",
    "angular",
    "django",
    "flask",
]

SENIORITY_RANK = {
    "Entry-level": 0,
    "Junior": 1,
    "Mid-level": 2,
    "Senior": 3,
    "Lead": 4,
}

SENIORITY_MIN_YEARS = {
    "Entry-level": 0,
    "Junior": 1,
    "Mid-level": 3,
    "Senior": 5,
    "Lead": 7,
}


def coerce_int(value, default=0):
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)

    match = re.search(r"-?\d+", str(value or ""))
    if match:
        return int(match.group(0))

    return default


def infer_candidate_seniority(years_of_experience):
    years = max(coerce_int(years_of_experience), 0)
    if years <= 1:
        return "Entry-level"
    if years <= 3:
        return "Junior"
    if years <= 5:
        return "Mid-level"
    if years <= 8:
        return "Senior"
    return "Lead"


def extract_required_years(job):
    text = f"{job.get('title', '')} {job.get('description', '')}".lower()
    patterns = [
        r"(\d+)\s*\+\s*years?(?:\s+of)?\s+experience",
        r"(\d+)\s*(?:-|to)\s*(\d+)\s+years?(?:\s+of)?\s+experience",
        r"at\s+least\s+(\d+)\s+years?(?:\s+of)?\s+experience",
        r"min(?:imum)?\s+of\s+(\d+)\s+years?(?:\s+of)?\s+experience",
        r"(\d+)\s+years?\s+experience",
    ]

    extracted_years = []
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            extracted_years.append(coerce_int(match.group(1), 0))

    return max(extracted_years) if extracted_years else 0


def infer_job_seniority(job, required_years=None):
    if required_years is None:
        required_years = extract_required_years(job)

    text = f"{job.get('title', '')} {job.get('description', '')}".lower()

    if any(keyword in text for keyword in ["principal", "staff engineer", "head of", "director"]):
        return "Lead"
    if any(keyword in text for keyword in ["lead", "manager", "architect"]):
        return "Lead"
    if "senior" in text or required_years >= 5:
        return "Senior"
    if any(keyword in text for keyword in ["mid-level", "mid level", "intermediate"]) or required_years >= 3:
        return "Mid-level"
    if any(keyword in text for keyword in ["junior", "associate"]) or required_years >= 1:
        return "Junior"
    if any(keyword in text for keyword in ["intern", "internship", "entry level", "entry-level", "graduate", "new grad"]):
        return "Entry-level"
    return "Entry-level"


def get_effective_required_years(job):
    explicit_required_years = extract_required_years(job)
    seniority = infer_job_seniority(job, explicit_required_years)
    return max(explicit_required_years, SENIORITY_MIN_YEARS.get(seniority, 0))


def is_experience_qualified(cv_data, job):
    candidate_years = max(coerce_int(cv_data.get("years_of_experience"), 0), 0)
    candidate_seniority = infer_candidate_seniority(candidate_years)
    required_years = get_effective_required_years(job)
    job_seniority = infer_job_seniority(job, required_years)

    if candidate_years + 1 < required_years:
        return False

    if SENIORITY_RANK.get(candidate_seniority, 0) + 1 < SENIORITY_RANK.get(job_seniority, 0):
        return False

    return True


def filter_jobs_by_experience(cv_data, jobs):
    filtered_jobs = []
    removed_jobs = 0

    for job in jobs:
        if is_experience_qualified(cv_data, job):
            filtered_jobs.append(job)
        else:
            removed_jobs += 1

    if removed_jobs:
        print(f"Filtered out {removed_jobs} jobs due to experience mismatch.")

    return filtered_jobs


def extract_job_required_skills(description_text, title_text=""):
    combined_text = f"{title_text or ''} {description_text or ''}".lower()
    required_skills = [tech for tech in COMMON_TECHS if tech in combined_text]
    return required_skills or ["communication", "teamwork"]


def build_skill_matches(cv_skills, required_skills):
    skill_matches = []
    matched_count = 0

    for required_skill in required_skills:
        is_matched = any(required_skill in user_skill for user_skill in cv_skills)
        if is_matched:
            matched_count += 1
            skill_matches.append(
                {"name": required_skill.title(), "required": True, "status": "matched"}
            )
        else:
            skill_matches.append(
                {
                    "name": required_skill.title(),
                    "required": True,
                    "status": "missing",
                    "improvementTip": f"Consider adding a project involving {required_skill.title()}.",
                }
            )

    return skill_matches, matched_count


def score_experience_alignment(candidate_years, required_years, candidate_seniority, job_seniority):
    experience_gap = required_years - candidate_years
    seniority_gap = SENIORITY_RANK.get(job_seniority, 0) - SENIORITY_RANK.get(candidate_seniority, 0)

    if required_years == 0:
        years_score = 45
    elif experience_gap <= -1:
        years_score = 60
    elif experience_gap == 0:
        years_score = 52
    elif experience_gap == 1:
        years_score = 28
    else:
        years_score = 8

    if seniority_gap <= 0:
        seniority_score = 15
    elif seniority_gap == 1:
        seniority_score = 8
    else:
        seniority_score = 0

    return years_score + seniority_score


def score_role_alignment(cv_role, job_title):
    role_tokens = [token for token in str(cv_role or "").lower().split() if token]
    title_tokens = [token for token in str(job_title or "").lower().split() if token]

    if role_tokens and any(token in title_tokens for token in role_tokens):
        return 10
    return 3


def score_skill_alignment(matched_count, total_required_skills):
    if total_required_skills <= 0:
        return 6
    return (matched_count / total_required_skills) * 10


def score_location_alignment(job):
    remote_option_lower = str(job.get("remote_option") or "").lower()
    location_lower = str(job.get("location") or "").lower()
    return 5 if "remote" in remote_option_lower or "remote" in location_lower else 3


def calculate_match(cv_data, job):
    scored_job = dict(job)
    cv_skills = [str(skill).lower() for skill in (cv_data.get("skills") or []) if skill]
    cv_role = str(cv_data.get("primary_role") or "").lower()
    candidate_years = max(coerce_int(cv_data.get("years_of_experience"), 0), 0)
    candidate_seniority = infer_candidate_seniority(candidate_years)
    required_years = get_effective_required_years(scored_job)
    job_seniority = infer_job_seniority(scored_job, required_years)
    required_skills = extract_job_required_skills(
        scored_job.get("description"),
        scored_job.get("title"),
    )
    skill_matches, matched_count = build_skill_matches(cv_skills, required_skills)

    experience_score = score_experience_alignment(
        candidate_years,
        required_years,
        candidate_seniority,
        job_seniority,
    )
    role_score = score_role_alignment(cv_role, scored_job.get("title"))
    skill_score = score_skill_alignment(matched_count, len(required_skills))
    location_score = score_location_alignment(scored_job)
    total_score = int(experience_score + role_score + skill_score + location_score)

    scored_job["skills"] = skill_matches
    scored_job["required_experience_years"] = required_years
    scored_job["candidate_experience_years"] = candidate_years
    scored_job["candidate_seniority"] = candidate_seniority
    scored_job["job_seniority"] = job_seniority
    scored_job["experienceQualified"] = True
    scored_job["matchScore"] = min(max(total_score, 0), 100)
    return scored_job


def rank_jobs(cv_data, jobs):
    qualified_jobs = filter_jobs_by_experience(cv_data, jobs)
    print(f"Calculating match scores for {len(qualified_jobs)} jobs...")
    matched_jobs = [calculate_match(cv_data, job) for job in qualified_jobs]
    matched_jobs.sort(key=lambda job: job["matchScore"], reverse=True)
    return matched_jobs
