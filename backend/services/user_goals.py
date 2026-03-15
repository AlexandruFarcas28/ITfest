from __future__ import annotations

from copy import deepcopy


PLAN_DEFAULTS = {
    "cut": {
        "goal_type": "cut",
        "daily_calorie_goal": 1900,
        "daily_protein_goal": 155,
        "daily_carbs_goal": 170,
        "daily_fats_goal": 60,
        "water_goal_ml": 2600,
    },
    "recomp": {
        "goal_type": "recomp",
        "daily_calorie_goal": 2200,
        "daily_protein_goal": 160,
        "daily_carbs_goal": 210,
        "daily_fats_goal": 70,
        "water_goal_ml": 2700,
    },
    "bulk": {
        "goal_type": "bulk",
        "daily_calorie_goal": 2700,
        "daily_protein_goal": 175,
        "daily_carbs_goal": 310,
        "daily_fats_goal": 80,
        "water_goal_ml": 3000,
    },
}


def _coerce_int(value, fallback: int) -> int:
    try:
        parsed = int(float(value))
    except (TypeError, ValueError):
        return fallback

    return parsed if parsed > 0 else fallback


def get_plan_defaults(goal_type: str | None = None) -> dict:
    plan_key = (goal_type or "recomp").strip().lower()
    if plan_key not in PLAN_DEFAULTS:
        plan_key = "recomp"

    return deepcopy(PLAN_DEFAULTS[plan_key])


def resolve_user_targets(user: dict | None) -> dict:
    defaults = get_plan_defaults((user or {}).get("goal_type"))
    source = user or {}

    return {
        "goal_type": defaults["goal_type"],
        "activity_level": str(source.get("activity_level") or "moderate"),
        "daily_calorie_goal": _coerce_int(
            source.get("daily_calorie_goal"),
            defaults["daily_calorie_goal"],
        ),
        "daily_protein_goal": _coerce_int(
            source.get("daily_protein_goal"),
            defaults["daily_protein_goal"],
        ),
        "daily_carbs_goal": _coerce_int(
            source.get("daily_carbs_goal"),
            defaults["daily_carbs_goal"],
        ),
        "daily_fats_goal": _coerce_int(
            source.get("daily_fats_goal"),
            defaults["daily_fats_goal"],
        ),
        "water_goal_ml": _coerce_int(
            source.get("water_goal_ml"),
            defaults["water_goal_ml"],
        ),
    }


def build_default_user_profile(goal_type: str | None = None) -> dict:
    defaults = get_plan_defaults(goal_type)
    return {
        **defaults,
        "activity_level": "moderate",
        "weight": None,
        "height": None,
        "age": None,
    }
