# QuickHire

QuickHire is an AI-assisted job matching application that turns an uploaded CV into a structured candidate profile, fetches relevant job listings, scores the fit, and shows ranked matches in a polished web dashboard.

The repository is split into:

- `frontend/`: React + TypeScript + Vite client
- `backend/`: Flask API for CV analysis and job retrieval

## What The Project Does

1. A user signs in with Firebase Authentication.
2. The user uploads a CV in `PDF` or `DOCX` format.
3. The backend extracts raw text from the file.
4. A Hugging Face LLM converts the CV into structured JSON.
5. Search queries are generated from the parsed role, skills, and location.
6. The backend fetches jobs from the JSearch RapidAPI endpoint.
7. Jobs are ranked by experience, role, skills, and remote/location alignment.
8. The frontend stores the resulting jobs in Firestore and renders match details plus skill-gap tips.

## Main Features

- CV upload with drag-and-drop UI
- Support for `PDF` and `DOCX` resumes
- LLM-based profile extraction
- Multi-query job search against RapidAPI
- Ranked match scores from `0-100`
- Skill gap analysis with improvement tips
- Firebase email/password and Google sign-in
- Saved job results per user in Firestore

## Architecture

### Frontend

- Built with React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion
- Uses Firebase Authentication for sign-in
- Uses Firestore to persist matched jobs under `users/{uid}/jobs`
- Calls the Flask backend with multipart file upload

### Backend

- Built with Flask and `flask-cors`
- Extracts text from CV files with `pdfplumber` and `python-docx`
- Uses LangChain + Hugging Face Inference to structure CV data
- Fetches jobs asynchronously with `aiohttp`
- Normalizes, deduplicates, filters, and ranks jobs before returning them

## Repository Layout

```text
QuickHire/
├── backend/
│   ├── app.py
│   ├── app_factory.py
│   ├── config.py
│   ├── routes/
│   │   └── analysis.py
│   ├── services/
│   │   ├── analysis_pipeline.py
│   │   ├── cv_analysis.py
│   │   ├── document_extractors.py
│   │   ├── job_fetcher.py
│   │   └── job_matching.py
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Firebase Auth
- Firestore

### Backend

- Flask
- Flask-CORS
- LangChain
- Hugging Face Inference API
- `aiohttp`
- `pdfplumber`
- `python-docx`

## Environment Variables

### Backend `.env`

Create `backend/.env` with:

```env
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
RAPIDAPI_KEY=your_rapidapi_key
```

Notes:

- `HUGGINGFACEHUB_API_TOKEN` is required for CV parsing.
- If `RAPIDAPI_KEY` is missing or set to `placeholder`, the backend falls back to mock jobs.

### Frontend `.env`

Create `frontend/.env` with:

```env
VITE_API_URL=http://127.0.0.1:5555
```

Notes:

- The frontend Firebase client config is currently hardcoded in `frontend/src/lib/firebase.ts`.
- If you want to use a different Firebase project, update that file.

## Local Development

### 1. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend runs on `http://127.0.0.1:5555`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will print the frontend URL, typically `http://127.0.0.1:5173`.

### 3. Use the app

1. Open the frontend in the browser.
2. Create an account or sign in.
3. Upload a `PDF` or `DOCX` CV.
4. Wait for the backend to parse the CV and return ranked job matches.
5. Open a job card to inspect the skill-gap breakdown and apply link.

## API Summary

### `GET /`

Health-style route that returns:

```json
{ "message": "QuickHire AI Backend is running" }
```

### `POST /analyze-cv?page=1`

Accepts multipart form-data with a `file` field.

Supported inputs:

- `.pdf`
- `.docx`

Successful response shape:

```json
{
  "status": "success",
  "candidate": {
    "candidate_name": "String",
    "primary_role": "String",
    "years_of_experience": 3,
    "skills": ["React", "Python"],
    "location": "Casablanca"
  },
  "matches": [],
  "search_query": "Software Engineer",
  "search_queries": ["Software Engineer", "Software Engineer React"]
}
```

## Match Scoring Overview

Jobs are ranked using a simple weighted scoring model based on:

- candidate experience vs required years
- candidate seniority vs inferred job seniority
- title alignment
- required skill matches found in the job description
- remote/location alignment

The backend also filters out jobs that are clearly above the candidate's experience level before scoring.

## Current Implementation Notes

- The frontend sends a Firebase ID token in the `Authorization` header, but the backend does not currently verify it.
- Backend CORS is open to `*` during development.
- LinkedIn auth in the UI is a placeholder and is not implemented.
- A `PricingPage.tsx` file exists in the frontend, but it is not currently wired into the router.
- There is no automated test suite in the repository at the moment.

## Suggested Next Improvements

- Verify Firebase ID tokens in the backend before processing uploads
- Move Firebase config to frontend environment variables
- Add backend and frontend tests
- Add file-size validation on upload
- Add pagination or infinite loading for additional job pages
- Tighten CORS for production deployment

## Project Status

This codebase already delivers the core QuickHire flow end-to-end:

- authenticate
- upload CV
- extract profile
- fetch jobs
- score matches
- persist results
- review saved jobs in Firestore

It is a solid MVP, with the main remaining work centered on hardening security, improving configuration management, and adding tests.
