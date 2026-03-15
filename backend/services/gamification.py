from __future__ import annotations

from datetime import datetime

try:
    from .user_goals import resolve_user_targets
    from ..utils.dates import shift_day, today_str
except ImportError:
    from services.user_goals import resolve_user_targets
    from utils.dates import shift_day, today_str

LEVEL_XP_STEP = 120
HYDRATION_STREAK_THRESHOLD = 0.8

BADGE_RULES = [
    {
        "id": "first_scan",
        "label": "First Scan",
        "description": "Logged your first AI meal analysis.",
        "predicate": lambda stats: stats["ai_scans"] >= 1,
    },
    {
        "id": "meal_starter",
        "label": "Meal Starter",
        "description": "Logged at least 5 meals.",
        "predicate": lambda stats: stats["meal_logs_count"] >= 5,
    },
    {
        "id": "streak_builder",
        "label": "Streak Builder",
        "description": "Reached a 3-day meal logging streak.",
        "predicate": lambda stats: stats["meal_logging_streak"] >= 3,
    },
    {
        "id": "hydration_hustler",
        "label": "Hydration Hustler",
        "description": "Hit a 3-day hydration streak.",
        "predicate": lambda stats: stats["hydration_streak"] >= 3,
    },
    {
        "id": "consistency_keeper",
        "label": "Consistency Keeper",
        "description": "Maintained a 3-day nutrition and hydration streak.",
        "predicate": lambda stats: stats["consistency_streak"] >= 3,
    },
    {
        "id": "favorite_curator",
        "label": "Favorite Curator",
        "description": "Saved 3 meals as favorites.",
        "predicate": lambda stats: stats["favorite_count"] >= 3,
    },
    {
        "id": "weekly_lock",
        "label": "Weekly Lock",
        "description": "Logged meals across 7 different days.",
        "predicate": lambda stats: stats["meal_days_count"] >= 7,
    },
]


def _streak_length(day_set: set[str], end_day: str | None = None) -> int:
    streak = 0
    cursor = end_day or today_str()

    while cursor in day_set:
        streak += 1
        cursor = shift_day(cursor, -1)

    return streak


def _serialize_badges(existing_badges: list[dict] | None, stats: dict) -> list[dict]:
    previous = {
        badge["id"]: badge
        for badge in (existing_badges or [])
        if isinstance(badge, dict) and badge.get("id")
    }
    now = datetime.utcnow().isoformat()
    awarded = []

    for rule in BADGE_RULES:
        if not rule["predicate"](stats):
            continue

        if rule["id"] in previous:
            awarded.append(previous[rule["id"]])
            continue

        awarded.append(
            {
                "id": rule["id"],
                "label": rule["label"],
                "description": rule["description"],
                "earned_at": now,
            }
        )

    return sorted(awarded, key=lambda badge: badge.get("earned_at") or "")


def refresh_user_progress(db, user_id: str, user: dict | None = None) -> dict:
    goals = resolve_user_targets(user)
    water_goal = goals["water_goal_ml"]

    nutrition_docs = list(
        db.nutrition.find(
            {"user_id": user_id},
            {"date": 1, "source": 1, "favorite": 1},
        )
    )
    meal_days = {doc.get("date") for doc in nutrition_docs if doc.get("date")}
    ai_scans = sum(1 for doc in nutrition_docs if doc.get("source") == "scan")
    favorite_count = sum(1 for doc in nutrition_docs if doc.get("favorite"))

    water_docs = list(
        db.water.find(
            {"user_id": user_id},
            {"date": 1, "amount_ml": 1, "goal_ml": 1},
        )
    )
    hydration_days = {
        doc.get("date")
        for doc in water_docs
        if doc.get("date")
        and (doc.get("amount_ml") or 0)
        >= int((doc.get("goal_ml") or water_goal) * HYDRATION_STREAK_THRESHOLD)
    }
    consistency_days = meal_days & hydration_days

    meal_logs_count = len(nutrition_docs)
    meal_days_count = len(meal_days)
    hydration_days_count = len(hydration_days)
    consistency_days_count = len(consistency_days)
    meal_logging_streak = _streak_length(meal_days)
    hydration_streak = _streak_length(hydration_days)
    consistency_streak = _streak_length(consistency_days)
    xp = (
        meal_logs_count * 12
        + meal_days_count * 18
        + hydration_days_count * 16
        + consistency_days_count * 22
        + ai_scans * 10
        + favorite_count * 4
    )
    level = max(1, (xp // LEVEL_XP_STEP) + 1)
    progress_stats = {
        "user_id": user_id,
        "meal_logging_streak": meal_logging_streak,
        "hydration_streak": hydration_streak,
        "consistency_streak": consistency_streak,
        "meal_logs_count": meal_logs_count,
        "meal_days_count": meal_days_count,
        "hydration_days_count": hydration_days_count,
        "consistency_days_count": consistency_days_count,
        "favorite_count": favorite_count,
        "ai_scans": ai_scans,
        "xp": xp,
        "level": level,
        "level_step_xp": LEVEL_XP_STEP,
        "level_progress_xp": xp - ((level - 1) * LEVEL_XP_STEP),
        "next_level_at": level * LEVEL_XP_STEP,
    }

    existing = db.user_progress.find_one({"user_id": user_id}) or {}
    progress_stats["badges"] = _serialize_badges(existing.get("badges"), progress_stats)
    progress_stats["updated_at"] = datetime.utcnow().isoformat()

    db.user_progress.update_one(
        {"user_id": user_id},
        {"$set": progress_stats},
        upsert=True,
    )

    return progress_stats
