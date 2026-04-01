import re
from hashlib import sha1


def sanitize_job_id(source, raw_id, title, company, location):
    base_id = str(raw_id).strip()
    if not base_id:
        digest = sha1(f"{title}|{company}|{location}".encode("utf-8")).hexdigest()[:16]
        base_id = digest

    safe_id = re.sub(r"[^a-zA-Z0-9._-]+", "-", base_id).strip("-") or "job"
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
        "internship": "Internship",
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
