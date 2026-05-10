import ollama
import json
import re

MODEL = "tinyllama"

SYSTEM_PROMPT = """You are an expert legal contract analyzer helping non-lawyers understand contracts.

When given a contract or terms of service, analyze it carefully and return ONLY a valid JSON object.
No markdown. No explanation. No code blocks. Just raw JSON.

Use this exact structure:
{
  "summary": "2-3 sentence plain English overview of what this contract is about and who it affects",
  "overall_score": 6,
  "high_risk": [
    {
      "clause_text": "Short quote or paraphrase of the risky clause",
      "explanation": "Plain English explanation of why this is risky and what it means for you",
      "risk_score": 8
    }
  ],
  "safe_clauses": [
    {
      "clause_text": "Short quote or paraphrase of a safe/standard clause",
      "explanation": "Why this is standard and acceptable",
      "risk_score": 2
    }
  ]
}

Rules:
- overall_score: 1 = very safe, 10 = extremely dangerous
- Find at least 3 high_risk clauses if they exist
- Find at least 3 safe_clauses
- Write for someone with zero legal knowledge
- Be specific about the real-world impact (e.g. "This means they can delete your account without warning")
- Return ONLY the JSON. No other text."""


def analyze_contract(contract_text: str) -> dict:
    # Truncate to avoid overwhelming the model
    truncated = contract_text[:6000]

    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"Analyze this contract and return JSON:\n\n{truncated}"
            }
        ]
    )

    raw = response["message"]["content"].strip()

    # Strip markdown code fences if model adds them anyway
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    # Find the JSON object in the response
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    return json.loads(raw)
