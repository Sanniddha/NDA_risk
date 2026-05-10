# ClauseGuard v2

> AI-powered legal contract analyzer — runs 100% offline using local LLM

## Features

- **PDF Upload** — Upload any contract PDF and get an instant plain-English risk report
- **URL Scraping** — Paste a URL (Terms of Service, NDA, lease) and the app scrapes + analyzes it
- **Text Paste** — Paste raw contract text for analysis
- **Risk Scoring** — Each clause scored 1–10 with plain-English explanations
- **100% Local** — Powered by Mistral via Ollama. No data ever leaves your device.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Python FastAPI |
| AI/LLM | Mistral 7B via Ollama (local) |
| PDF | PyMuPDF |
| Scraping | requests + BeautifulSoup4 |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com/download) installed with `mistral` model

### 1. Start Ollama
```bash
ollama pull mistral    # one-time download (~4.5GB)
ollama serve           # keep running in background
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Open Browser
```
http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/analyze/pdf` | Upload PDF file |
| POST | `/analyze/url` | Submit URL (form data) |
| POST | `/analyze/text` | Submit raw text (form data) |

## Demo URLs for Testing
- https://policies.google.com/terms
- Any NDA template PDF from Google

---

Built for **INNOVATEX 1.0** • MAKAUT 2026
