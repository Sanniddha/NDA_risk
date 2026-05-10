import ollama
import json
import re

MODEL = "qwen2:1.5b"

SYSTEM_PROMPT = """
You are an expert legal contract analyzer helping non-lawyers understand contracts.

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
- Be specific about the real-world impact
- Return ONLY the JSON. No other text.

Consistency Rules:
- If overall_score >= 7, high_risk must contain at least 3 items
- If overall_score <= 3, safe_clauses should dominate
- Never return an empty high_risk array when risk score is high
- Never contradict the overall score
"""

def analyze_contract(contract_text: str) -> dict:

    # Reduce prompt size for low-memory EC2 instances
    truncated = contract_text[:2000]

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

    # Remove markdown code blocks if model adds them
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    # Extract JSON object from response
    match = re.search(r"\{.*\}", raw, re.DOTALL)

    if match:
        raw = match.group(0)

    try:
        data = json.loads(raw)

        # Ensure required keys exist
        data.setdefault("summary", "No summary generated.")
        data.setdefault("overall_score", "Unknown")
        data.setdefault("high_risk", [])
        data.setdefault("safe_clauses", [])

        # Fix inconsistent outputs

        if (
            isinstance(data.get("overall_score"), int)
            and data["overall_score"] >= 7
            and len(data["high_risk"]) == 0
        ):
            data["high_risk"] = [
                {
                    "clause_text": "Potentially risky clauses detected but model could not extract them clearly.",
                    "explanation": "The contract appears risky overall, but the AI failed to identify specific clauses.",
                    "risk_score": data["overall_score"]
                }
            ]

        if (
            isinstance(data.get("overall_score"), int)
            and data["overall_score"] <= 3
            and len(data["safe_clauses"]) == 0
        ):
            data["safe_clauses"] = [
                {
                    "clause_text": "The contract appears relatively standard.",
                    "explanation": "The AI considers this agreement generally safe.",
                    "risk_score": 2
                }
            ]

        return data

    except Exception:

        return {
            "summary": raw,
            "overall_score": "Unknown",
            "high_risk": [
                {
                    "clause_text": "AI could not fully analyze this contract.",
                    "explanation": "The language model returned an invalid or incomplete response.",
                    "risk_score": 5
                }
            ],
            "safe_clauses": []
        }
