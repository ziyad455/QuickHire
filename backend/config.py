import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    huggingface_api_token: str | None
    huggingface_model: str
    rapidapi_key: str | None
    max_jobs_per_query: int
    max_search_queries: int
    max_total_results: int
    rapidapi_timeout_seconds: int
    cv_text_limit: int


settings = Settings(
    huggingface_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
    huggingface_model="meta-llama/Llama-3.3-70B-Instruct",
    rapidapi_key=os.getenv("RAPIDAPI_KEY"),
    max_jobs_per_query=6,
    max_search_queries=3,
    max_total_results=18,
    rapidapi_timeout_seconds=30,
    cv_text_limit=10000,
)
