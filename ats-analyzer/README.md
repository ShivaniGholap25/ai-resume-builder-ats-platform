# AI Resume Builder & ATS Optimization Platform

A full-stack AI-powered career platform built with **React + Tailwind**, **Node.js + Express**, and **MongoDB**. Build ATS-optimized resumes, analyze them for compatibility, match against job descriptions, and get AI-powered optimization suggestions.

## Features

- 📄 Upload PDF or DOCX resume
- 🔍 Extract and analyze resume text
- 🎯 ATS Score out of 100
- 📋 Detect missing sections (Summary, Skills, Experience, etc.)
- 📞 Contact info validation (email, phone, LinkedIn, GitHub)
- 🎨 Formatting issue detection
- ⚡ Weak skills detection + action verb analysis
- 🔑 NLP keyword matching against job description
- 💡 Prioritized improvement suggestions
- 📜 Analysis history stored in MongoDB

---

## Project Structure

```
ats-analyzer/
├── backend/
│   ├── server.js              ← Express entry point
│   ├── .env                   ← Environment variables
│   ├── package.json
│   ├── routes/
│   │   ├── analyzeRoutes.js   ← POST /api/analyze
│   │   └── historyRoutes.js   ← GET/DELETE /api/history
│   ├── models/
│   │   └── Analysis.js        ← Mongoose schema
│   ├── services/
│   │   ├── resumeParser.js    ← PDF/DOCX text extraction
│   │   └── atsScorer.js       ← ATS scoring logic (NLP)
│   ├── middleware/
│   │   └── upload.js          ← Multer file upload config
│   └── utils/
│       └── db.js              ← MongoDB connection
└── frontend/
    ├── src/
    │   ├── App.jsx            ← Root component + tab nav
    │   ├── api/
    │   │   └── analyzeApi.js  ← Axios API calls
    │   └── components/
    │       ├── dashboard/
    │       │   ├── UploadForm.jsx       ← Drag-and-drop upload
    │       │   ├── ResultsDashboard.jsx ← Full results view
    │       │   └── HistoryPanel.jsx     ← Past analyses
    │       └── ui/
    │           ├── ScoreGauge.jsx       ← Circular score display
    │           ├── ScoreBreakdown.jsx   ← Category score bars
    │           ├── IssueCard.jsx        ← Issue list cards
    │           ├── KeywordCloud.jsx     ← Keyword pills
    │           ├── SuggestionsPanel.jsx ← Improvement tips
    │           └── SectionsChecklist.jsx← Section detection
    └── vite.config.js
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

---

## Setup & Run

### 1. Start MongoDB
Make sure MongoDB is running locally on port 27017, or update `MONGO_URI` in `backend/.env`.

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| POST   | /api/analyze       | Upload resume + optional JD        |
| GET    | /api/history       | Get last 20 analyses               |
| GET    | /api/history/:id   | Get single analysis by ID          |
| DELETE | /api/history/:id   | Delete an analysis record          |

---

## ATS Scoring Breakdown

| Category       | Max Points | Description                              |
|----------------|-----------|------------------------------------------|
| Sections       | 25        | Core sections present (5 sections)       |
| Contact Info   | 20        | Email, phone, LinkedIn, GitHub           |
| Formatting     | 20        | No ATS-breaking formatting issues        |
| Skills Quality | 15        | No weak skills, uses action verbs        |
| Keyword Match  | 20        | Match % against job description          |
| **Total**      | **100**   |                                          |

---

## NLP Techniques Used

- **Tokenization** — `natural` library WordTokenizer
- **Stemming** — Porter Stemmer for root word matching
- **Stopword removal** — `stopword` library
- **Pattern matching** — Regex for sections, contact info, formatting
- **Keyword frequency** — Unique JD keyword extraction and matching
