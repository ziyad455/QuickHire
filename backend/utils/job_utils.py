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


def normalize_text_filter(value):
    return " ".join(str(value or "").split()).strip()


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


def normalize_remote_filter(value):
    normalized = normalize_text_filter(value).lower()
    mapping = {
        "remote": "Remote",
        "hybrid": "Hybrid",
        "on-site": "On-site",
        "onsite": "On-site",
        "on site": "On-site",
    }
    return mapping.get(normalized, "")


def normalize_job_filters(filters):
    filters = filters or {}
    location = normalize_text_filter(filters.get("location"))
    employment_type = normalize_text_filter(filters.get("type"))
    remote_option = normalize_remote_filter(filters.get("remote_option"))

    return {
        "location": location,
        "type": normalize_employment_type(employment_type) if employment_type else "",
        "remote_option": remote_option,
    }


def get_job_remote_option(job):
    normalized_remote_option = normalize_remote_filter(job.get("remote_option"))
    if normalized_remote_option:
        return normalized_remote_option

    return normalize_remote_option(job.get("location"), False)


def job_matches_filters(job, filters):
    normalized_filters = normalize_job_filters(filters)

    if normalized_filters["location"]:
        job_location = str(job.get("location") or "").lower()
        if normalized_filters["location"].lower() not in job_location:
            return False

    if normalized_filters["type"]:
        job_type = normalize_employment_type(job.get("type"))
        if job_type != normalized_filters["type"]:
            return False

    if normalized_filters["remote_option"]:
        if get_job_remote_option(job) != normalized_filters["remote_option"]:
            return False

    return True


def filter_jobs_by_preferences(jobs, filters):
    normalized_filters = normalize_job_filters(filters)
    if not any(normalized_filters.values()):
        return jobs

    filtered_jobs = [job for job in jobs if job_matches_filters(job, normalized_filters)]
    removed_jobs = len(jobs) - len(filtered_jobs)

    if removed_jobs:
        print(f"Filtered out {removed_jobs} jobs due to user preferences.")

    return filtered_jobs


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
