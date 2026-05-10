from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time

from pdf_parser import extract_text_from_pdf
from url_scraper import scrape_url
from llm_service import analyze_contract

app = FastAPI(title="ClauseGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ClauseGuard API running",
        "model": "qwen2:1.5b"
    }

@app.post("/analyze/pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    # Read uploaded PDF
    file_bytes = await file.read()

    # Extract text from PDF
    contract_text = extract_text_from_pdf(file_bytes)

    # Validate extracted text
    if len(contract_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from this PDF. It may be scanned/image-based."
        )

    print("Starting PDF analysis...")

    start = time.time()

    # Run AI analysis
    result = analyze_contract(contract_text)

    elapsed = time.time() - start

    print(f"PDF ANALYSIS TIME: {elapsed:.2f} seconds")

    # Add metadata
    result["source_type"] = "pdf"
    result["source_name"] = file.filename

    return result

@app.post("/analyze/url")
async def analyze_url(url: str = Form(...)):
    # Validate URL
    if not url.startswith("http"):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid URL starting with http or https"
        )

    try:
        contract_text = scrape_url(url)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    if len(contract_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough text from this URL"
        )

    print("Starting URL analysis...")

    start = time.time()

    result = analyze_contract(contract_text)

    elapsed = time.time() - start

    print(f"URL ANALYSIS TIME: {elapsed:.2f} seconds")

    result["source_type"] = "url"
    result["source_name"] = url

    return result

@app.post("/analyze/text")
async def analyze_text(contract_text: str = Form(...)):
    # Validate text length
    if len(contract_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Contract text is too short"
        )

    print("Starting TEXT analysis...")

    start = time.time()

    result = analyze_contract(contract_text)

    elapsed = time.time() - start

    print(f"TEXT ANALYSIS TIME: {elapsed:.2f} seconds")

    result["source_type"] = "text"
    result["source_name"] = "Pasted text"

    return result
