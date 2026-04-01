import re

import aiohttp

from config import settings

REMOTE_LOCATION_VALUES = {
    "",
    "not specified",
    "remote/not specified",
    "remote",
    "anywhere",
    "worldwide",
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


def map_years_of_experience(years_of_experience):
    years = max(coerce_int(years_of_experience), 0)
    if years < 1:
        return "LESS_THAN_ONE"
    if years <= 3:
        return "ONE_TO_THREE"
    if years <= 6:
        return "FOUR_TO_SIX"
    if years <= 9:
        return "SEVEN_TO_NINE"
    if years <= 14:
        return "TEN_TO_FOURTEEN"
    return "ABOVE_FIFTEEN"


def normalize_candidate_location(location):
    cleaned = " ".join(str(location or "").split()).strip()
    if cleaned.lower() in REMOTE_LOCATION_VALUES:
        return None
    return cleaned or None


def build_salary_query(cv_data):
    job_title = " ".join(str(cv_data.get("primary_role") or "").split()).strip()
    location = normalize_candidate_location(cv_data.get("location"))

    if not job_title or not location:
        return None

    return {
        "job_title": job_title,
        "location": location,
        "location_type": "ANY",
        "years_of_experience": map_years_of_experience(cv_data.get("years_of_experience")),
    }


def normalize_salary_record(record, query):
    return {
        "job_title": record.get("job_title") or query["job_title"],
        "location": record.get("location") or query["location"],
        "min_salary": record.get("min_salary"),
        "max_salary": record.get("max_salary"),
        "median_salary": record.get("median_salary"),
        "min_base_salary": record.get("min_base_salary"),
        "max_base_salary": record.get("max_base_salary"),
        "median_base_salary": record.get("median_base_salary"),
        "min_additional_pay": record.get("min_additional_pay"),
        "max_additional_pay": record.get("max_additional_pay"),
        "median_additional_pay": record.get("median_additional_pay"),
        "salary_period": record.get("salary_period"),
        "salary_currency": record.get("salary_currency"),
        "salary_count": record.get("salary_count"),
        "salaries_updated_at": record.get("salaries_updated_at"),
        "publisher_name": record.get("publisher_name"),
        "publisher_link": record.get("publisher_link"),
        "confidence": record.get("confidence"),
        "experience_band": query["years_of_experience"],
    }


async def fetch_salary_insight_for_candidate(cv_data):
    query = build_salary_query(cv_data)
    if not query:
        return None

    if not settings.job_salary_api_key:
        print("WARNING: Job salary API key is missing. Skipping salary enrichment.")
        return None

    headers = {
        "Accept": "*/*",
        settings.job_salary_api_key_header: settings.job_salary_api_key,
    }
    if settings.job_salary_api_host:
        headers["x-rapidapi-host"] = settings.job_salary_api_host

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                settings.job_salary_api_url,
                headers=headers,
                params=query,
                timeout=aiohttp.ClientTimeout(total=settings.rapidapi_timeout_seconds),
            ) as response:
                if response.status != 200:
                    error_body = await response.text()
                    print(
                        "Job salary API non-200 response: "
                        f"{response.status} body={error_body[:300]}"
                    )
                    return None

                payload = await response.json()
                status = payload.get("status")
                if status not in {None, "OK"}:
                    print(f"Job salary API unexpected payload for query '{query}': {payload}")
                    return None

                records = payload.get("data")
                if isinstance(records, dict):
                    records = [records]
                if not isinstance(records, list) or not records:
                    return None

                return normalize_salary_record(records[0], query)
    except Exception as exc:
        print(f"Job salary API error: {repr(exc)}")

    return None
