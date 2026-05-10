import ollama
import json
import re

MODEL = "qwen2:1.5b"

SYSTEM_PROMPT = """
You are an expert legal contract analyzer helping non-lawyers understand contracts.

When given a contract or terms of service, analyze it carefully and return ONLY a valid JSON object.
No markdown. No explanation. No code blocks. Just raw JSON.

The following JSON is ONLY an example template showing the required structure.
The values shown are placeholders/examples and MUST be dynamically generated based on the actual contract content.
Do NOT reuse the example scores or text unless they genuinely match the contract.


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

  "moderate_risk": [
    {
      "clause_text": "Short quote or paraphrase of the moderate-risk clause",
      "explanation": "Plain English explanation of why this deserves caution",
      "risk_score": 5
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

Scoring Guide:
- 1-2 = standard harmless agreement
- 3-4 = mostly safe with minor concerns
- 5-6 = moderate caution required
- 7-8 = significant legal or financial risks
- 9-10 = extremely dangerous, abusive, exploitative, or coercive terms

Important Rules:
- Only identify clauses as high risk if they create unusual legal, financial, privacy, reputational, racial discrimination, sexual harassment, exploitation, or coercive risks for the affected party.
- Find at least 3 high_risk clauses IF they genuinely exist
- Find moderate_risk clauses when appropriate
- Find at least 3 safe_clauses if possible
- Write for someone with zero legal knowledge
- Be specific about the real-world impact
- Return ONLY the JSON. No other text.

Consistency Rules:
- If overall_score >= 7, high_risk must contain at least 2 items
- If overall_score <= 3, safe_clauses should dominate
- Never contradict the overall score
"""

def analyze_contract(contract_text: str) -> dict:

    # Reduce prompt size for small EC2 instances
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
        data.setdefault("overall_score", 5)
        data.setdefault("high_risk", [])
        data.setdefault("moderate_risk", [])
        data.setdefault("safe_clauses", [])

        # Clamp score range safely
        if isinstance(data["overall_score"], int):
            data["overall_score"] = max(1, min(10, data["overall_score"]))
        else:
            data["overall_score"] = 5

        # Fix inconsistent outputs

        if (
            data["overall_score"] >= 7
            and len(data["high_risk"]) == 0
        ):
            data["high_risk"] = [
                {
                    "clause_text": "Potentially risky clauses detected but model could not extract them clearly.",
                    "explanation": "The agreement appears risky overall, but the AI failed to identify specific clauses.",
                    "risk_score": data["overall_score"]
                }
            ]

        if (
            data["overall_score"] <= 3
            and len(data["safe_clauses"]) == 0
        ):
            data["safe_clauses"] = [
                {
                    "clause_text": "The agreement appears relatively standard.",
                    "explanation": "The AI considers this contract generally safe and typical.",
                    "risk_score": 2
                }
            ]

        return data

    except Exception:

        # Fallback response if JSON parsing fails
        return {
            "summary": raw,
            "overall_score": 5,

            "high_risk": [
                {
                    "clause_text": "AI could not fully analyze this contract.",
                    "explanation": "The language model returned an incomplete or malformed response.",
                    "risk_score": 5
                }
            ],

            "moderate_risk": [],

            "safe_clauses": []
        }
