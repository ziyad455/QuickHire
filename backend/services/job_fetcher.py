import asyncio

import aiohttp

from config import settings
from utils.job_utils import (
    deduplicate_jobs,
    normalize_employment_type,
    normalize_location,
    normalize_remote_option,
    sanitize_job_id,
)


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

    return unique_queries[: settings.max_search_queries] or ["Software Engineer"]


async def fetch_global_jobs(session, keywords, page, rapidapi_key):
    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {
        "query": keywords,
        "page": str(page),
        "num_pages": "1",
    }
    headers = {
        "x-rapidapi-key": rapidapi_key,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
    }

    try:
        async with session.get(
            url,
            headers=headers,
            params=querystring,
            timeout=aiohttp.ClientTimeout(total=settings.rapidapi_timeout_seconds),
        ) as response:
            if response.status == 200:
                data = await response.json()
                if data.get("status") != "OK":
                    print(f"JSearch unexpected payload for query '{keywords}': {data}")
                    return []

                job_list = data.get("data")
                if not isinstance(job_list, list):
                    job_list = []

                return [
                    {
                        "id": sanitize_job_id(
                            "jsearch",
                            job.get("job_id"),
                            job.get("job_title", ""),
                            job.get("employer_name", ""),
                            job.get("job_location")
                            or normalize_location(job.get("job_city", ""), job.get("job_state", "")),
                        ),
                        "title": job.get("job_title", "Unknown"),
                        "company": job.get("employer_name", "Unknown"),
                        "location": job.get("job_location")
                        or normalize_location(job.get("job_city", ""), job.get("job_state", "")),
                        "source": job.get("job_publisher") or "JSearch",
                        "apply_url": job.get("job_apply_link", ""),
                        "description": job.get("job_description", ""),
                        "date_posted": (
                            job.get("job_posted_at")
                            or job.get("job_posted_human_readable")
                            or job.get("job_posted_at_datetime_utc")
                            or ""
                        ),
                        "query_used": keywords,
                        "type": normalize_employment_type(
                            job.get("job_employment_type_text") or job.get("job_employment_type")
                        ),
                        "remote_option": normalize_remote_option(
                            job.get("job_location") or job.get("job_city"),
                            job.get("job_is_remote", False),
                        ),
                    }
                    for job in list(job_list)[: settings.max_jobs_per_query]
                ]

            error_body = await response.text()
            print(f"JSearch non-200 response: {response.status} body={error_body[:300]}")
    except Exception as exc:
        print(f"JSearch Error: {repr(exc)}")

    return []


async def fetch_all_jobs(search_queries, page=1):
    if not settings.rapidapi_key or settings.rapidapi_key == "placeholder":
        print("WARNING: Using mock jobs because RAPIDAPI_KEY is missing/invalid.")
        return get_mock_jobs()

    queries = search_queries if isinstance(search_queries, list) else [search_queries]

    async with aiohttp.ClientSession() as session:
        tasks = [
            asyncio.create_task(fetch_global_jobs(session, keywords, page, settings.rapidapi_key))
            for keywords in queries[: settings.max_search_queries]
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        jobs = [job for sublist in results if isinstance(sublist, list) for job in sublist]

        if not jobs:
            print("WARNING: All RapidAPIs returned 0 jobs, falling back to mock jobs.")
            return get_mock_jobs()

        return deduplicate_jobs(jobs)[: settings.max_total_results]


async def fetch_jobs_for_candidate(cv_data, page=1):
    search_queries = generate_search_queries(cv_data)
    print("Fetching jobs from RapidAPI using queries:", search_queries)
    jobs = await fetch_all_jobs(search_queries, page=page)
    return search_queries, jobs


def get_mock_jobs():
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
            "matchScore": 0,
        }
    ]
