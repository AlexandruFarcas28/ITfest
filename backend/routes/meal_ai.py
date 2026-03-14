import base64
import json
import os

import requests
from flask import Blueprint, jsonify, request

meal_ai_bp = Blueprint("meal_ai", __name__)


def _extract_output_text(payload):
  if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
    return payload["output_text"]

  for item in payload.get("output", []):
    for content in item.get("content", []):
      text_value = content.get("text")

      if isinstance(text_value, str) and text_value.strip():
        return text_value

      if isinstance(text_value, dict) and isinstance(text_value.get("value"), str):
        return text_value["value"]

  for candidate in payload.get("candidates", []):
    content = candidate.get("content", {})

    for part in content.get("parts", []):
      text_value = part.get("text")

      if isinstance(text_value, str) and text_value.strip():
        return text_value

  return None


def _coerce_number(value):
  if isinstance(value, (int, float)):
    return value

  if isinstance(value, str):
    try:
      return float(value)
    except ValueError:
      return None

  return None


def _normalize_result(parsed):
  foods = parsed.get("detected_foods")

  return {
    "detected_foods": foods if isinstance(foods, list) else [],
    "estimated_calories": _coerce_number(parsed.get("estimated_calories")),
    "protein_g": _coerce_number(parsed.get("protein_g")),
    "carbs_g": _coerce_number(parsed.get("carbs_g")),
    "fats_g": _coerce_number(parsed.get("fats_g")),
    "confidence": str(parsed.get("confidence") or "medium"),
    "notes": str(
      parsed.get("notes")
      or "AI-based approximate calorie estimation from food images."
    ),
  }


def _build_generation_schema():
  return {
    "type": "object",
    "propertyOrdering": [
      "detected_foods",
      "estimated_calories",
      "protein_g",
      "carbs_g",
      "fats_g",
      "confidence",
      "notes",
    ],
    "properties": {
      "detected_foods": {
        "type": "array",
        "items": {"type": "string"},
      },
      "estimated_calories": {
        "type": ["number", "null"],
      },
      "protein_g": {
        "type": ["number", "null"],
      },
      "carbs_g": {
        "type": ["number", "null"],
      },
      "fats_g": {
        "type": ["number", "null"],
      },
      "confidence": {
        "type": "string",
        "enum": ["low", "medium", "high"],
      },
      "notes": {"type": "string"},
    },
    "required": [
      "detected_foods",
      "estimated_calories",
      "protein_g",
      "carbs_g",
      "fats_g",
      "confidence",
      "notes",
    ],
  }


@meal_ai_bp.route("/ai/estimate-meal", methods=["POST", "OPTIONS"])
def estimate_meal():
  if request.method == "OPTIONS":
    return ("", 204)

  try:
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    model = os.getenv("GEMINI_MEAL_MODEL", "gemini-2.5-flash")

    if not gemini_api_key:
      return jsonify({"error": "GEMINI_API_KEY is missing on the server"}), 500

    if "image" not in request.files:
      return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()
    image_mime_type = image_file.mimetype or "image/jpeg"

    if not image_bytes:
      return jsonify({"error": "Empty image"}), 400

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
You are a nutrition estimation assistant.
Analyze the meal photo and return ONLY valid JSON with this exact structure:
{
  "detected_foods": ["string"],
  "estimated_calories": number_or_null,
  "protein_g": number_or_null,
  "carbs_g": number_or_null,
  "fats_g": number_or_null,
  "confidence": "low|medium|high",
  "notes": "short disclaimer about approximation"
}

Rules:
- Be conservative and approximate.
- If portion size is unclear, estimate carefully.
- Do not return markdown.
- Do not return extra explanation outside JSON.
"""

    response = requests.post(
      f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
      headers={
        "Content-Type": "application/json",
        "x-goog-api-key": gemini_api_key,
      },
      json={
        "contents": [
          {
            "parts": [
              {"text": prompt},
              {
                "inline_data": {
                  "mime_type": image_mime_type,
                  "data": base64_image,
                }
              },
            ]
          }
        ],
        "generationConfig": {
          "responseMimeType": "application/json",
          "responseJsonSchema": _build_generation_schema(),
        },
      },
      timeout=60,
    )
  except requests.Timeout:
    return jsonify({
      "error": "Gemini request timed out",
      "details": "Serverul nu a primit raspuns de la Gemini in intervalul asteptat."
    }), 504
  except requests.RequestException as exc:
    return jsonify({
      "error": "Gemini request could not be completed",
      "details": str(exc)
    }), 502
  except Exception as exc:
    return jsonify({
      "error": "Gemini integration error",
      "details": str(exc)
    }), 500

  if response.status_code != 200:
    try:
      error_payload = response.json()
      error_message = error_payload.get("error", {}).get("message") or response.text
    except Exception:
      error_message = response.text

    return jsonify({
      "error": "Gemini request failed",
      "details": error_message
    }), response.status_code

  payload = response.json()
  output_text = _extract_output_text(payload)

  if not output_text:
    return jsonify({
      "error": "Unexpected Gemini response format",
      "details": payload
    }), 500

  try:
    parsed = json.loads(output_text)
  except json.JSONDecodeError:
    return jsonify({
      "error": "Gemini did not return valid JSON",
      "raw": output_text
    }), 500

  return jsonify(_normalize_result(parsed)), 200
