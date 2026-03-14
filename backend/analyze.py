import base64
import json
import os

import requests
from flask import Blueprint, jsonify, request

analyze_food_bp = Blueprint("analyze_food", __name__)

# ─── Config ──────────────────────────────────────────────────────────────────
# Schimba cu modelul tau vision cand il ai
# Ex: "llava", "llava:13b", "moondream", "bakllava"
OLLAMA_MODEL = os.environ.get("VISION_MODEL", "llava")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")


# ─── Route ───────────────────────────────────────────────────────────────────

@analyze_food_bp.route("/api/analyze-food", methods=["POST"])
def analyze_food():
    """
    Primeste o imagine (base64 sau multipart) si returneaza:
    {
        "food_name": "Chicken breast",
        "calories": 220,
        "protein": 30,
        "carbs": 0,
        "fats": 5,
        "confidence": "high"
    }
    """

    image_b64 = None

    # Accepta atat JSON cu base64 cat si multipart form-data
    if request.is_json:
        data = request.get_json()
        image_b64 = data.get("image")  # base64 string
    else:
        file = request.files.get("image")
        if file:
            image_b64 = base64.b64encode(file.read()).decode("utf-8")

    if not image_b64:
        return jsonify({"error": "No image provided"}), 400

    # Curata prefixul data:image/...;base64, daca exista
    if "," in image_b64:
        image_b64 = image_b64.split(",")[1]

    try:
        result = call_vision_model(image_b64)
        return jsonify(result), 200
    except Exception as e:
        print(f"[analyze-food] Error: {e}")
        return jsonify({"error": str(e)}), 500


# ─── Vision model call ────────────────────────────────────────────────────────

def call_vision_model(image_b64: str) -> dict:
    """
    Trimite imaginea la Ollama si parseaza raspunsul ca JSON.
    Inlocuieste aceasta functie cu orice alt model vision pe care il folosesti.
    """

    prompt = """You are a nutrition expert. Look at this food image and respond ONLY with a valid JSON object, no extra text.

JSON format:
{
  "food_name": "name of the food in English",
  "calories": <integer, estimated kcal per serving>,
  "protein": <integer, grams>,
  "carbs": <integer, grams>,
  "fats": <integer, grams>,
  "confidence": "high" | "medium" | "low"
}

If you cannot identify food, return:
{"error": "Could not identify food"}"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "images": [image_b64],
        "stream": False,
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=30)
    response.raise_for_status()

    raw_text = response.json().get("response", "")

    # Incearca sa extraga JSON-ul din raspuns
    parsed = extract_json(raw_text)
    return parsed


def extract_json(text: str) -> dict:
    """Extrage primul bloc JSON valid din textul modelului."""
    text = text.strip()

    # Incearca direct
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Cauta intre ```json ... ```
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip().lstrip("json").strip()
            try:
                return json.loads(part)
            except json.JSONDecodeError:
                continue

    # Cauta intre { }
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass

    return {"error": "Could not parse AI response", "raw": text}