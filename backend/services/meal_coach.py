from __future__ import annotations

import base64
import json
import os

import requests

try:
    from .health_data import sum_entries
    from .user_goals import resolve_user_targets
    from ..utils.dates import today_str
except ImportError:
    from services.health_data import sum_entries
    from services.user_goals import resolve_user_targets
    from utils.dates import today_str

MOCK_MEAL_LIBRARY = [
    {
        "meal_name": "Chicken Rice Bowl",
        "meal_type": "lunch",
        "detected_foods": ["grilled chicken", "rice", "mixed vegetables"],
        "estimated_calories": 560,
        "protein_g": 39,
        "carbs_g": 58,
        "fats_g": 16,
        "description": "Likely a chicken rice bowl with vegetables and a light savory sauce.",
        "confidence": "medium",
        "confidence_reason": "Portion size and sauces are partly hidden, so this is an estimate.",
    },
    {
        "meal_name": "Salmon Quinoa Plate",
        "meal_type": "dinner",
        "detected_foods": ["salmon", "quinoa", "greens"],
        "estimated_calories": 640,
        "protein_g": 42,
        "carbs_g": 41,
        "fats_g": 27,
        "description": "This looks like salmon with quinoa and a bed of greens.",
        "confidence": "medium",
        "confidence_reason": "The plate is clear, but oil usage and serving size are uncertain.",
    },
    {
        "meal_name": "Yogurt Fruit Bowl",
        "meal_type": "breakfast",
        "detected_foods": ["Greek yogurt", "berries", "granola"],
        "estimated_calories": 380,
        "protein_g": 24,
        "carbs_g": 42,
        "fats_g": 11,
        "description": "Likely a Greek yogurt bowl with fruit and granola topping.",
        "confidence": "high",
        "confidence_reason": "The ingredients are visually distinct, though topping quantity is estimated.",
    },
    {
        "meal_name": "Pasta Bowl",
        "meal_type": "dinner",
        "detected_foods": ["pasta", "tomato sauce", "cheese"],
        "estimated_calories": 720,
        "protein_g": 24,
        "carbs_g": 92,
        "fats_g": 24,
        "description": "This appears to be a pasta bowl with tomato sauce and some cheese.",
        "confidence": "medium",
        "confidence_reason": "The recipe is recognizable, but exact ingredients and portion size vary a lot.",
    },
    {
        "meal_name": "Burger and Fries",
        "meal_type": "lunch",
        "detected_foods": ["burger", "fries"],
        "estimated_calories": 930,
        "protein_g": 32,
        "carbs_g": 88,
        "fats_g": 48,
        "description": "Likely a burger served with fries and condiments.",
        "confidence": "medium",
        "confidence_reason": "The meal type is clear, but bun size, sauces, and fry portion can change totals a lot.",
    },
]


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
        return int(round(float(value)))
    if isinstance(value, str):
        try:
            return int(round(float(value)))
        except ValueError:
            return None
    return None


def _build_generation_schema():
    return {
        "type": "object",
        "propertyOrdering": [
            "meal_name",
            "meal_type",
            "detected_foods",
            "estimated_calories",
            "protein_g",
            "carbs_g",
            "fats_g",
            "description",
            "confidence",
            "confidence_reason",
            "goal_comparison",
            "improvement_suggestions",
            "later_meal_suggestion",
            "notes",
        ],
        "properties": {
            "meal_name": {"type": "string"},
            "meal_type": {"type": "string", "enum": ["breakfast", "lunch", "dinner", "snack"]},
            "detected_foods": {"type": "array", "items": {"type": "string"}},
            "estimated_calories": {"type": ["number", "null"]},
            "protein_g": {"type": ["number", "null"]},
            "carbs_g": {"type": ["number", "null"]},
            "fats_g": {"type": ["number", "null"]},
            "description": {"type": "string"},
            "confidence": {"type": "string", "enum": ["low", "medium", "high"]},
            "confidence_reason": {"type": "string"},
            "goal_comparison": {"type": "string"},
            "improvement_suggestions": {"type": "array", "items": {"type": "string"}},
            "later_meal_suggestion": {"type": "string"},
            "notes": {"type": "string"},
        },
        "required": [
            "meal_name",
            "meal_type",
            "detected_foods",
            "estimated_calories",
            "protein_g",
            "carbs_g",
            "fats_g",
            "description",
            "confidence",
            "confidence_reason",
            "goal_comparison",
            "improvement_suggestions",
            "later_meal_suggestion",
            "notes",
        ],
    }


def _build_context(db, user: dict | None) -> dict:
    goals = resolve_user_targets(user)
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fats": 0}

    if user is not None:
        today_entries = list(
            db.nutrition.find(
                {"user_id": str(user["_id"]), "date": today_str()},
                {"calories": 1, "protein": 1, "carbs": 1, "fats": 1},
            )
        )
        totals = sum_entries(today_entries)

    return {"goals": goals, "today_totals": totals}


def _goal_comparison(meal: dict, context: dict) -> str:
    goals = context["goals"]
    calories = meal.get("estimated_calories") or 0
    protein = meal.get("protein_g") or 0
    carbs = meal.get("carbs_g") or 0
    fats = meal.get("fats_g") or 0
    calorie_share = round((calories / max(goals["daily_calorie_goal"], 1)) * 100)
    protein_share = round((protein / max(goals["daily_protein_goal"], 1)) * 100)

    macro_note = []
    if protein_share >= 25:
        macro_note.append("protein contribution is solid")
    if carbs >= fats + 15:
        macro_note.append("carbs are leading the meal")
    if fats >= 25:
        macro_note.append("fats are on the heavier side")

    detail = ", ".join(macro_note) if macro_note else "macro balance looks moderate"
    return (
        f"For your {goals['goal_type']} goal, this meal covers about {calorie_share}% of daily calories "
        f"and {protein_share}% of your protein target; {detail}."
    )


def _meal_suggestions(meal: dict, context: dict) -> list[str]:
    goals = context["goals"]
    suggestions = []
    protein = meal.get("protein_g") or 0
    carbs = meal.get("carbs_g") or 0
    fats = meal.get("fats_g") or 0
    calories = meal.get("estimated_calories") or 0

    if protein < goals["daily_protein_goal"] * 0.18:
        suggestions.append("Add a lean protein side like Greek yogurt, eggs, tofu, or chicken.")
    if goals["goal_type"] == "cut" and calories > goals["daily_calorie_goal"] * 0.35:
        suggestions.append("Trim dense extras like creamy sauces or fries to keep calories tighter.")
    elif goals["goal_type"] == "bulk" and calories < goals["daily_calorie_goal"] * 0.2:
        suggestions.append("If this is a main meal, add a larger carb portion to support energy and recovery.")
    if fats > carbs and fats >= 25:
        suggestions.append("Balance the meal with vegetables or fruit to add volume without much extra fat.")
    if not suggestions:
        suggestions.append("Keep the plate as-is and use your next meal to round out any remaining macro gaps.")

    return suggestions[:2]


def _later_meal_suggestion(meal: dict, context: dict) -> str:
    goals = context["goals"]
    today_totals = context["today_totals"]
    remaining_protein = max(goals["daily_protein_goal"] - today_totals["protein"] - (meal.get("protein_g") or 0), 0)
    remaining_carbs = max(goals["daily_carbs_goal"] - today_totals["carbs"] - (meal.get("carbs_g") or 0), 0)
    remaining_fats = max(goals["daily_fats_goal"] - today_totals["fats"] - (meal.get("fats_g") or 0), 0)

    if remaining_protein >= max(remaining_carbs, remaining_fats):
        return "Later today, anchor your next meal around lean protein with vegetables and a modest carb side."
    if remaining_carbs >= max(remaining_protein, remaining_fats):
        return "Later today, include a controlled carb source like rice, potatoes, oats, or fruit with protein."
    return "Later today, keep the next meal lighter and focus on protein plus produce to stay balanced."


def _normalize_result(parsed: dict, context: dict, analysis_mode: str) -> dict:
    meal = {
        "analysis_mode": analysis_mode,
        "meal_name": str(parsed.get("meal_name") or "Scanned meal"),
        "meal_type": str(parsed.get("meal_type") or "lunch"),
        "detected_foods": parsed.get("detected_foods") if isinstance(parsed.get("detected_foods"), list) else [],
        "estimated_calories": _coerce_number(parsed.get("estimated_calories")),
        "protein_g": _coerce_number(parsed.get("protein_g")),
        "carbs_g": _coerce_number(parsed.get("carbs_g")),
        "fats_g": _coerce_number(parsed.get("fats_g")),
        "description": str(parsed.get("description") or "Meal estimate generated from the uploaded image."),
        "confidence": str(parsed.get("confidence") or "medium"),
        "confidence_reason": str(
            parsed.get("confidence_reason")
            or "Visual estimation can shift with hidden ingredients and portion size."
        ),
        "goal_comparison": str(parsed.get("goal_comparison") or ""),
        "improvement_suggestions": parsed.get("improvement_suggestions")
        if isinstance(parsed.get("improvement_suggestions"), list)
        else [],
        "later_meal_suggestion": str(parsed.get("later_meal_suggestion") or ""),
        "notes": str(
            parsed.get("notes")
            or "Nutrition from images is approximate and should be treated as an estimate."
        ),
    }

    if not meal["goal_comparison"]:
        meal["goal_comparison"] = _goal_comparison(meal, context)
    if not meal["improvement_suggestions"]:
        meal["improvement_suggestions"] = _meal_suggestions(meal, context)
    if not meal["later_meal_suggestion"]:
        meal["later_meal_suggestion"] = _later_meal_suggestion(meal, context)

    return meal


def _fallback_meal_coach(image_bytes: bytes, context: dict) -> dict:
    template = MOCK_MEAL_LIBRARY[sum(image_bytes) % len(MOCK_MEAL_LIBRARY)]
    meal = _normalize_result(template, context, analysis_mode="demo")
    meal["notes"] = "Demo meal-coach fallback was used because live vision analysis is unavailable."
    return meal


def _gemini_prompt(context: dict) -> str:
    goals = context["goals"]
    today = context["today_totals"]
    return f"""
You are an evidence-aware AI meal coach for a fitness app.
Analyze the meal photo and return ONLY valid JSON with the required fields.

User goal context:
- Goal type: {goals["goal_type"]}
- Daily calorie goal: {goals["daily_calorie_goal"]}
- Daily protein goal: {goals["daily_protein_goal"]}
- Daily carbs goal: {goals["daily_carbs_goal"]}
- Daily fats goal: {goals["daily_fats_goal"]}
- Calories already logged today: {today["calories"]}
- Protein already logged today: {today["protein"]}
- Carbs already logged today: {today["carbs"]}
- Fats already logged today: {today["fats"]}

Rules:
- Be conservative and realistic about portions.
- Explain uncertainty directly when the image is ambiguous.
- goal_comparison must mention how the meal fits the user goal.
- improvement_suggestions must contain 1 or 2 concrete suggestions.
- later_meal_suggestion must tell the user what to eat later to balance the day.
- Do not return markdown.
- Do not return any text outside JSON.
"""


def generate_meal_coach(db, image_bytes: bytes, image_mime_type: str, user: dict | None = None) -> dict:
    context = _build_context(db, user)
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    model = os.getenv("GEMINI_MEAL_MODEL", "gemini-2.5-flash")

    if not gemini_api_key:
        return _fallback_meal_coach(image_bytes, context)

    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        headers={"Content-Type": "application/json", "x-goog-api-key": gemini_api_key},
        json={
            "contents": [
                {
                    "parts": [
                        {"text": _gemini_prompt(context)},
                        {"inline_data": {"mime_type": image_mime_type, "data": base64_image}},
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
    response.raise_for_status()
    output_text = _extract_output_text(response.json())

    if not output_text:
        raise ValueError("Unexpected Gemini response format")

    return _normalize_result(json.loads(output_text), context, analysis_mode="live")
