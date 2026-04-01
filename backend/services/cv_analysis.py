import json

from langchain_core.prompts import PromptTemplate
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

from config import settings
from utils.json_utils import extract_json_object

if not settings.huggingface_api_token or settings.huggingface_api_token == "placeholder":
    print("WARNING: HUGGINGFACEHUB_API_TOKEN is not set correctly in .env!")

_parse_cv_prompt = PromptTemplate(
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
{cv_text}""",
)

_endpoint = HuggingFaceEndpoint(
    repo_id=settings.huggingface_model,
    max_new_tokens=1024,
    huggingfacehub_api_token=settings.huggingface_api_token,
    temperature=0.1,
)
_parse_cv_chain = _parse_cv_prompt | ChatHuggingFace(llm=_endpoint)


def parse_cv_text(cv_text: str, filename: str):
    print(f"Extracting structured data via LLM for {filename}...")
    response = _parse_cv_chain.invoke({"cv_text": cv_text[: settings.cv_text_limit]})
    content = response.content if hasattr(response, "content") else str(response)
    json_payload = extract_json_object(content)

    if not json_payload:
        raise ValueError("LLM failed to return a valid JSON structure.")

    return json.loads(json_payload)
