from __future__ import annotations

from collections import Counter
from datetime import datetime

try:
    from .image_storage import serialize_entry_image_fields
    from .user_goals import resolve_user_targets
    from ..utils.dates import daterange, today_str, weekday_label
except ImportError:
    from services.image_storage import serialize_entry_image_fields
    from services.user_goals import resolve_user_targets
    from utils.dates import daterange, today_str, weekday_label

MEAL_TYPE_LABELS = {
    "breakfast": "Breakfast",
    "lunch": "Lunch",
    "dinner": "Dinner",
    "snack": "Snack",
}


def _as_int(value, fallback: int = 0) -> int:
    try:
        return int(round(float(value or 0)))
    except (TypeError, ValueError):
        return fallback


def infer_meal_type(created_at: str | None, explicit: str | None = None) -> str:
    normalized = (explicit or "").strip().lower()
    if normalized in MEAL_TYPE_LABELS:
        return normalized

    if created_at:
        try:
            hour = datetime.fromisoformat(created_at.replace("Z", "+00:00")).hour
        except ValueError:
            hour = 12
    else:
        hour = 12

    if hour < 11:
        return "breakfast"
    if hour < 15:
        return "lunch"
    if hour < 20:
        return "dinner"
    return "snack"


def serialize_meal(entry: dict) -> dict:
    created_at = entry.get("created_at") or entry.get("updated_at")
    meal_type = infer_meal_type(created_at, entry.get("meal_type"))
    return {
        "id": str(entry.get("_id") or entry.get("id") or ""),
        "name": str(entry.get("name") or "Meal"),
        "date": str(entry.get("date") or today_str()),
        "meal_type": meal_type,
        "meal_type_label": MEAL_TYPE_LABELS.get(meal_type, "Meal"),
        "source": str(entry.get("source") or "manual"),
        "favorite": bool(entry.get("favorite")),
        "repeatable": bool(entry.get("repeatable", True)),
        "created_at": str(created_at or datetime.utcnow().isoformat()),
        "updated_at": str(entry.get("updated_at") or created_at or datetime.utcnow().isoformat()),
        "calories": _as_int(entry.get("calories")),
        "protein": _as_int(entry.get("protein")),
        "carbs": _as_int(entry.get("carbs")),
        "fats": _as_int(entry.get("fats")),
        "analysis_mode": str(entry.get("analysis_mode") or "manual"),
        "detected_foods": list(entry.get("detected_foods") or []),
        "ai_description": entry.get("ai_description"),
        "ai_confidence": entry.get("ai_confidence"),
        "confidence_reason": entry.get("confidence_reason"),
        "goal_comparison": entry.get("goal_comparison"),
        "improvement_suggestions": list(entry.get("improvement_suggestions") or []),
        "later_meal_suggestion": entry.get("later_meal_suggestion"),
        "notes": entry.get("notes"),
        "user_corrections": entry.get("user_corrections"),
        **serialize_entry_image_fields(entry),
    }


def sum_entries(entries: list[dict]) -> dict:
    return {
        "calories": sum(_as_int(entry.get("calories")) for entry in entries),
        "protein": sum(_as_int(entry.get("protein")) for entry in entries),
        "carbs": sum(_as_int(entry.get("carbs")) for entry in entries),
        "fats": sum(_as_int(entry.get("fats")) for entry in entries),
        "meals_logged": len(entries),
    }


def build_goal_progress(value: int, target: int) -> dict:
    safe_target = max(1, _as_int(target, 1))
    safe_value = max(0, _as_int(value))
    ratio = min(safe_value / safe_target, 1.4)
    return {
        "value": safe_value,
        "target": safe_target,
        "remaining": max(safe_target - safe_value, 0),
        "ratio": round(ratio, 4),
        "percent": min(int(round(ratio * 100)), 140),
    }


def list_entries_for_day(db, user_id: str, day: str) -> list[dict]:
    return list(
        db.nutrition.find(
            {"user_id": user_id, "date": day},
            sort=[("created_at", 1), ("_id", 1)],
        )
    )


def get_water_snapshot(db, user_id: str, day: str, water_goal: int) -> dict:
    record = db.water.find_one({"user_id": user_id, "date": day}) or {}
    amount_ml = _as_int(record.get("amount_ml"))
    goal_ml = _as_int(record.get("goal_ml"), water_goal)
    return {
        "date": day,
        "amount_ml": amount_ml,
        "goal_ml": goal_ml,
        "progress": build_goal_progress(amount_ml, goal_ml),
    }


def _status_summary(goals: dict, totals: dict, water_amount: int) -> str:
    protein_gap = max(goals["daily_protein_goal"] - totals["protein"], 0)
    calorie_gap = max(goals["daily_calorie_goal"] - totals["calories"], 0)
    water_gap = max(goals["water_goal_ml"] - water_amount, 0)

    if totals["meals_logged"] == 0:
        return "You have not logged a meal yet today. Start with a protein-forward meal to set the tone."
    if protein_gap >= 35:
        return f"Protein is your main gap today. Prioritize about {protein_gap}g more to stay aligned with your goal."
    if water_gap >= 700:
        return f"Hydration is trailing. Another {water_gap} ml would bring you much closer to your daily target."
    if calorie_gap <= 250:
        return "You are close to your calorie target. Keep the next meal controlled and nutrient-dense."
    return "Your day is tracking well. Keep your last meal balanced and use hydration to finish strong."


def _focus_card(goals: dict, totals: dict, water_amount: int) -> dict:
    protein_gap = max(goals["daily_protein_goal"] - totals["protein"], 0)
    carb_gap = max(goals["daily_carbs_goal"] - totals["carbs"], 0)
    fat_gap = max(goals["daily_fats_goal"] - totals["fats"], 0)
    water_gap = max(goals["water_goal_ml"] - water_amount, 0)
    candidates = [
        (
            protein_gap,
            {
                "title": "Today’s focus: close the protein gap",
                "description": f"Aim for roughly {protein_gap}g more protein with lean meat, Greek yogurt, tofu, or eggs.",
                "cta": "Build dinner around protein",
            },
        ),
        (
            water_gap / 10,
            {
                "title": "Today’s focus: finish hydration strong",
                "description": f"You still have around {water_gap} ml to drink. Split it across 2 easy refills.",
                "cta": "Refill your bottle now",
            },
        ),
        (
            carb_gap,
            {
                "title": "Today’s focus: use carbs strategically",
                "description": "Add a moderate carb source later only if you still need training fuel or recovery support.",
                "cta": "Keep carbs purposeful",
            },
        ),
        (
            fat_gap,
            {
                "title": "Today’s focus: keep fats controlled",
                "description": "Use fats to round out the meal, not dominate it, so calories stay predictable.",
                "cta": "Favor lighter sauces",
            },
        ),
    ]
    best_gap, best_card = max(candidates, key=lambda item: item[0])
    if best_gap <= 0:
        return {
            "title": "Today’s focus: maintain the momentum",
            "description": "Your intake is well balanced so far. Finish with a simple meal and steady hydration.",
            "cta": "Protect the streak",
        }
    return best_card


def daily_rollup(db, user_id: str, goals: dict, days: int = 7) -> list[dict]:
    timeline = daterange(days)
    nutrition_map = {
        row["_id"]: row
        for row in db.nutrition.aggregate(
            [
                {"$match": {"user_id": user_id, "date": {"$in": timeline}}},
                {
                    "$group": {
                        "_id": "$date",
                        "calories": {"$sum": "$calories"},
                        "protein": {"$sum": "$protein"},
                        "carbs": {"$sum": "$carbs"},
                        "fats": {"$sum": "$fats"},
                        "meal_count": {"$sum": 1},
                    }
                },
            ]
        )
    }
    water_map = {
        row["date"]: row
        for row in db.water.find(
            {"user_id": user_id, "date": {"$in": timeline}},
            {"date": 1, "amount_ml": 1, "goal_ml": 1},
        )
    }
    rollup = []

    for day in timeline:
        meal_row = nutrition_map.get(day, {})
        water_row = water_map.get(day, {})
        calories = _as_int(meal_row.get("calories"))
        protein = _as_int(meal_row.get("protein"))
        carbs = _as_int(meal_row.get("carbs"))
        fats = _as_int(meal_row.get("fats"))
        macro_ratios = [
            protein / max(goals["daily_protein_goal"], 1),
            carbs / max(goals["daily_carbs_goal"], 1),
            fats / max(goals["daily_fats_goal"], 1),
        ]
        macro_deviation = sum(min(abs(1 - ratio), 1) for ratio in macro_ratios) / len(macro_ratios)
        macro_balance_score = max(0, int(round((1 - macro_deviation) * 100)))

        rollup.append(
            {
                "date": day,
                "label": weekday_label(day),
                "calories": calories,
                "protein": protein,
                "carbs": carbs,
                "fats": fats,
                "meal_count": _as_int(meal_row.get("meal_count")),
                "water_ml": _as_int(water_row.get("amount_ml")),
                "water_goal_ml": _as_int(water_row.get("goal_ml"), goals["water_goal_ml"]),
                "macro_balance_score": macro_balance_score,
            }
        )

    return rollup


def build_dashboard(db, user: dict, progress: dict) -> dict:
    goals = resolve_user_targets(user)
    day = today_str()
    entries = [serialize_meal(entry) for entry in list_entries_for_day(db, str(user["_id"]), day)]
    totals = sum_entries(entries)
    water_snapshot = get_water_snapshot(db, str(user["_id"]), day, goals["water_goal_ml"])
    water_amount = water_snapshot["amount_ml"]

    return {
        "date": day,
        "goals": goals,
        "totals": {**totals, "water_ml": water_amount},
        "progress": {
            "calories": build_goal_progress(totals["calories"], goals["daily_calorie_goal"]),
            "protein": build_goal_progress(totals["protein"], goals["daily_protein_goal"]),
            "carbs": build_goal_progress(totals["carbs"], goals["daily_carbs_goal"]),
            "fats": build_goal_progress(totals["fats"], goals["daily_fats_goal"]),
            "water": water_snapshot["progress"],
        },
        "quick_summary": _status_summary(goals, totals, water_amount),
        "today_focus": _focus_card(goals, totals, water_amount),
        "recent_meals": list(reversed(entries[-3:])),
        "gamification": progress,
    }


def _habit_rates(rollup: list[dict], goals: dict) -> dict:
    total_days = max(len(rollup), 1)
    calorie_days = sum(
        1
        for day in rollup
        if day["calories"] > 0
        and abs(day["calories"] - goals["daily_calorie_goal"]) <= goals["daily_calorie_goal"] * 0.15
    )
    protein_days = sum(1 for day in rollup if day["protein"] >= goals["daily_protein_goal"] * 0.9)
    hydration_days = sum(1 for day in rollup if day["water_ml"] >= goals["water_goal_ml"] * 0.8)
    logging_days = sum(1 for day in rollup if day["meal_count"] > 0)

    return {
        "Calorie pacing": calorie_days / total_days,
        "Protein target": protein_days / total_days,
        "Hydration rhythm": hydration_days / total_days,
        "Meal logging": logging_days / total_days,
    }


def generate_weekly_summary(
    rollup: list[dict],
    strongest_habit: str,
    weakest_habit: str,
) -> str:
    avg_calories = round(sum(day["calories"] for day in rollup) / max(len(rollup), 1))
    avg_water = round(sum(day["water_ml"] for day in rollup) / max(len(rollup), 1))
    avg_macro_score = round(sum(day["macro_balance_score"] for day in rollup) / max(len(rollup), 1))

    return (
        f"This week averaged about {avg_calories} kcal and {avg_water} ml of water per day, "
        f"with macro balance scoring around {avg_macro_score}/100. "
        f"Your strongest habit was {strongest_habit.lower()}, while {weakest_habit.lower()} "
        f"needs the most attention next week."
    )


def build_weekly_insights(db, user: dict) -> dict:
    user_id = str(user["_id"])
    goals = resolve_user_targets(user)
    rollup = daily_rollup(db, user_id, goals, days=7)
    entries = list(
        db.nutrition.find(
            {"user_id": user_id, "date": {"$in": [day["date"] for day in rollup]}},
            {"meal_type": 1, "created_at": 1},
        )
    )
    meal_types = [infer_meal_type(entry.get("created_at"), entry.get("meal_type")) for entry in entries]
    most_common_meal_type = Counter(meal_types).most_common(1)
    habit_rates = _habit_rates(rollup, goals)
    strongest_habit = max(habit_rates, key=habit_rates.get)
    weakest_habit = min(habit_rates, key=habit_rates.get)

    return {
        "period_start": rollup[0]["date"],
        "period_end": rollup[-1]["date"],
        "goals": goals,
        "calorie_trend": [{"label": day["label"], "value": day["calories"]} for day in rollup],
        "hydration_trend": [{"label": day["label"], "value": day["water_ml"]} for day in rollup],
        "macro_balance_trend": [{"label": day["label"], "value": day["macro_balance_score"]} for day in rollup],
        "macro_average": {
            "protein": round(sum(day["protein"] for day in rollup) / max(len(rollup), 1)),
            "carbs": round(sum(day["carbs"] for day in rollup) / max(len(rollup), 1)),
            "fats": round(sum(day["fats"] for day in rollup) / max(len(rollup), 1)),
        },
        "most_common_meal_type": MEAL_TYPE_LABELS.get(
            most_common_meal_type[0][0] if most_common_meal_type else "snack",
            "Snack",
        ),
        "strongest_habit": strongest_habit,
        "weakest_habit": weakest_habit,
        "weekly_summary": generate_weekly_summary(
            rollup,
            strongest_habit=strongest_habit,
            weakest_habit=weakest_habit,
        ),
    }


def build_meal_history(db, user: dict, days: int = 14, limit: int = 30) -> dict:
    user_id = str(user["_id"])
    goals = resolve_user_targets(user)
    history_days = daterange(days)
    history_entries = list(
        db.nutrition.find(
            {"user_id": user_id, "date": {"$in": history_days}},
            sort=[("created_at", -1), ("_id", -1)],
            limit=max(1, min(limit, 80)),
        )
    )
    serialized = [serialize_meal(entry) for entry in history_entries]
    rollup = daily_rollup(db, user_id, goals, days=min(max(days, 7), 21))
    favorite_count = sum(1 for entry in serialized if entry["favorite"])
    ai_meals = sum(1 for entry in serialized if entry["source"] == "scan")

    return {
        "items": serialized,
        "daily_totals": [
            {
                "date": day["date"],
                "label": day["label"],
                "total_calories": day["calories"],
                "protein": day["protein"],
                "carbs": day["carbs"],
                "fats": day["fats"],
                "water_ml": day["water_ml"],
            }
            for day in rollup
        ],
        "stats": {
            "favorite_count": favorite_count,
            "ai_meal_count": ai_meals,
            "logged_meal_count": len(serialized),
        },
    }
