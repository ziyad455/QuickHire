import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    huggingface_api_token: str | None
    huggingface_model: str
    rapidapi_key: str | None
    linkedin_location_id: str
    job_salary_api_key: str | None
    job_salary_api_url: str
    job_salary_api_host: str | None
    job_salary_api_key_header: str
    max_jobs_per_query: int
    max_search_queries: int
    max_total_results: int
    rapidapi_timeout_seconds: int
    cv_text_limit: int


settings = Settings(
    huggingface_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
    huggingface_model="meta-llama/Llama-3.3-70B-Instruct",
    rapidapi_key=os.getenv("RAPIDAPI_KEY"),
    linkedin_location_id=os.getenv("LINKEDIN_LOCATION_ID", "92000000"),
    job_salary_api_key=os.getenv("JOB_SALARY_API_KEY") or os.getenv("RAPIDAPI_KEY"),
    job_salary_api_url=os.getenv(
        "JOB_SALARY_API_URL",
        "https://job-salary-data.p.rapidapi.com/job-salary",
    ),
    job_salary_api_host=os.getenv("JOB_SALARY_API_HOST", "job-salary-data.p.rapidapi.com"),
    job_salary_api_key_header=os.getenv("JOB_SALARY_API_KEY_HEADER", "x-rapidapi-key"),
    max_jobs_per_query=6,
    max_search_queries=3,
    max_total_results=18,
    rapidapi_timeout_seconds=30,
    cv_text_limit=10000,
)
