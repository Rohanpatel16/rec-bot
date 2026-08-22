# 🎯 AI Recruitment Bot (Groq AI + Google X-Ray Search + Google Sheets)

An AI-powered recruitment engine using **Groq AI** (`qwen/qwen3.6-27b`) to parse Job Descriptions, generate Google X-Ray & LinkedIn Boolean search queries, discover candidate profiles, score candidate suitability with logical reasoning, generate personalized LinkedIn connection notes, and sync everything directly with Google Sheets.

---

## ⚡ Features

1. **Job Description Intelligence (Groq AI)**:
   - Simplifies complex JDs into plain-English executive summaries.
   - Extracts keywords, required/nice-to-have skills, Do's & Don'ts, and recruiter screening questions.
   - Generates targeted **Google X-Ray queries** (`site:linkedin.com/in/...`) and **LinkedIn Boolean search strings**.

2. **Candidate Discovery & Scraping**:
   - Executes Google X-Ray search to pull candidate LinkedIn profiles.
   - Extracts Name, Headline, Current Role, Company, Location, and Bio snippets.

3. **AI Candidate Scoring & Connection Notes**:
   - Computes a **0-100% Match Score** (`HIGH_MATCH`, `MEDIUM_MATCH`, `LOW_MATCH`) against JD criteria.
   - Identifies key skill gaps and red flags.
   - Drafts personalized **LinkedIn Connection Notes** (< 300 characters).

4. **Google Sheets Sync**:
   - Automatically populates `🎯 JDs_Analysis` and appends evaluated candidates to `👥 Candidate_Pool`.

---

## 🚀 Quick Setup & Usage

### 1. Installation
```bash
git clone https://github.com/Rohanpatel16/rec-bot.git
cd rec-bot
npm install
```

### 2. Environment Variables (`.env`)
Copy `.env.example` to `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=qwen/qwen3.6-27b
SPREADSHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### 3. Run the Bot
- **Process JDs from Google Sheets**:
  ```bash
  node recruiter.mjs
  ```
- **Direct CLI Job Description Input**:
  ```bash
  node recruiter.mjs --jd "Looking for a Senior Full Stack Developer (Node.js & React) in Bengaluru..."
  ```
