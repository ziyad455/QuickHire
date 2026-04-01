import asyncio

from exceptions import AppError
from services.cv_analysis import parse_cv_text
from services.document_extractors import extract_text_from_upload
from services.job_fetcher import fetch_jobs_for_candidate
from services.job_matching import rank_jobs
from services.salary_fetcher import fetch_salary_insight_for_candidate


async def collect_market_data(structured_data, page, job_filters=None):
    jobs_task = asyncio.create_task(
        fetch_jobs_for_candidate(structured_data, page=page, job_filters=job_filters)
    )
    salary_task = asyncio.create_task(fetch_salary_insight_for_candidate(structured_data))
    (search_queries, jobs), salary_insight = await asyncio.gather(jobs_task, salary_task)
    return search_queries, jobs, salary_insight


def analyze_cv_upload(file_storage, page=1, job_filters=None):
    filename = (file_storage.filename or "").lower()
    if not filename:
        raise AppError("No selected file.", status_code=400)

    file_bytes = file_storage.read()
    cv_text = extract_text_from_upload(filename, file_bytes)
    if not cv_text.strip():
        raise AppError("Could not extract text from the file.", status_code=400)

    structured_data = parse_cv_text(cv_text, filename)
    search_queries, jobs, salary_insight = asyncio.run(
        collect_market_data(structured_data, page, job_filters=job_filters)
    )
    matched_jobs = rank_jobs(structured_data, jobs)

    return {
        "status": "success",
        "candidate": structured_data,
        "matches": matched_jobs,
        "salary_insight": salary_insight,
        "search_query": search_queries[0] if search_queries else "",
        "search_queries": search_queries,
    }
