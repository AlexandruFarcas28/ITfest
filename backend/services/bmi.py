from __future__ import annotations

from datetime import datetime


BMI_LIMITATIONS = [
    "BMI is a general screening metric, not a diagnosis.",
    "It estimates weight relative to height, but does not directly measure body fat.",
    "It can be less accurate for very muscular people or anyone with atypical body composition.",
]

GOAL_LABELS = {
    "cut": "weight loss",
    "recomp": "maintenance",
    "bulk": "muscle gain",
}

BMI_CATEGORIES = [
    {
        "id": "underweight",
        "label": "Underweight",
        "max": 18.5,
        "short": "Your BMI sits below the common reference range.",
    },
    {
        "id": "normal",
        "label": "Normal range",
        "max": 25.0,
        "short": "Your BMI sits inside the common reference range.",
    },
    {
        "id": "overweight",
        "label": "Overweight",
        "max": 30.0,
        "short": "Your BMI is above the common reference range.",
    },
    {
        "id": "obesity",
        "label": "Obesity",
        "max": float("inf"),
        "short": "Your BMI is well above the common reference range.",
    },
]


def _round_weight(value: float | None) -> float | None:
    if value is None:
        return None
    return round(float(value), 1)


def _goal_label(goal_type: str | None) -> str:
    return GOAL_LABELS.get((goal_type or "recomp").strip().lower(), "maintenance")


def _current_timestamp() -> str:
    return datetime.utcnow().isoformat()


def _coerce_number(value) -> float | None:
    if value in (None, ""):
        return None

    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None

    return parsed if parsed > 0 else None


def calculate_bmi(weight_kg, height_cm) -> float | None:
    weight = _coerce_number(weight_kg)
    height = _coerce_number(height_cm)

    if not weight or not height:
        return None

    height_m = height / 100
    return round(weight / (height_m * height_m), 1)


def healthy_weight_range(height_cm) -> tuple[float | None, float | None]:
    height = _coerce_number(height_cm)
    if not height:
        return (None, None)

    height_m = height / 100
    return (
        round(18.5 * height_m * height_m, 1),
        round(24.9 * height_m * height_m, 1),
    )


def categorize_bmi(bmi_value: float | None) -> dict:
    if bmi_value is None:
        return {
            "id": "unknown",
            "label": "Not available",
            "short": "Add your height and weight to see a BMI estimate.",
        }

    for category in BMI_CATEGORIES:
        if bmi_value < category["max"]:
            return category

    return BMI_CATEGORIES[-1]


def _healthy_weight_delta(weight_kg, range_min, range_max) -> dict | None:
    weight = _coerce_number(weight_kg)
    if weight is None or range_min is None or range_max is None:
        return None

    if weight < range_min:
        return {
            "status": "below",
            "difference_kg": round(range_min - weight, 1),
            "message": f"About {round(range_min - weight, 1)} kg below the common healthy range.",
        }
    if weight > range_max:
        return {
            "status": "above",
            "difference_kg": round(weight - range_max, 1),
            "message": f"About {round(weight - range_max, 1)} kg above the common healthy range.",
        }

    return {
        "status": "within",
        "difference_kg": 0.0,
        "message": "Currently inside the common healthy weight range for your height.",
    }


def _goal_alignment(category_id: str, goal_type: str | None) -> str:
    goal_label = _goal_label(goal_type)

    if category_id == "underweight":
        if goal_type == "bulk":
            return "Your current BMI supports a muscle-gain phase, but steady nutrition and progressive training matter more than BMI alone."
        return f"For a {goal_label} goal, prioritize a gradual increase in strength, food quality, and body weight rather than chasing fast scale changes."

    if category_id == "normal":
        if goal_type == "cut":
            return "A mild calorie deficit and strong protein intake may be enough if your goal is to lean out while staying in a balanced range."
        if goal_type == "bulk":
            return "You are starting from a balanced range, which can be a solid base for a controlled muscle-gain phase."
        return "You are already in a broadly balanced range, so consistency and body composition changes may matter more than the scale alone."

    if category_id == "overweight":
        if goal_type == "bulk":
            return "Because your BMI is already elevated, a full surplus may be less useful than maintenance or recomposition while improving training quality."
        return f"For a {goal_label} goal, steady calorie control, movement, and protein consistency are likely more useful than aggressive dieting."

    if category_id == "obesity":
        return f"For a {goal_label} goal, focus on sustainable routines, medical context if needed, and small repeatable habits instead of extreme short-term restriction."

    return "BMI is only one signal. Use it together with energy levels, strength, habits, and progress photos."


def _recommendation(category_id: str, goal_type: str | None) -> dict:
    goal_label = _goal_label(goal_type)

    if category_id == "underweight":
        return {
            "title": "Build up steadily",
            "summary": f"With a {goal_label} focus, aim for a consistent routine that supports recovery and gradual progress.",
            "actions": [
                "Keep meals regular and protein present in every main meal.",
                "Add calorie-dense extras gradually instead of forcing huge portions.",
                "Use strength training and sleep consistency to support healthy weight gain.",
            ],
        }

    if category_id == "normal":
        if goal_type == "bulk":
            return {
                "title": "Lean muscle-gain approach",
                "summary": "You have room to pursue muscle gain without rushing body-weight changes.",
                "actions": [
                    "Use a controlled calorie surplus instead of an aggressive bulk.",
                    "Anchor progress around strength, recovery, and protein intake.",
                    "Track weekly trends, not day-to-day noise.",
                ],
            }
        if goal_type == "cut":
            return {
                "title": "Refine without overcorrecting",
                "summary": "A small deficit and training consistency are usually enough here.",
                "actions": [
                    "Keep protein high and activity steady.",
                    "Let measurements and photos guide changes, not BMI alone.",
                    "Avoid extreme restriction that hurts training quality.",
                ],
            }
        return {
            "title": "Protect a balanced baseline",
            "summary": "You are in a generally balanced range, so consistency matters more than dramatic change.",
            "actions": [
                "Keep training and hydration predictable.",
                "Use weight trends over multiple weeks before adjusting calories.",
                "Focus on performance, energy, and recovery markers.",
            ],
        }

    if category_id == "overweight":
        return {
            "title": "Use steady recomposition habits",
            "summary": "You do not need extreme tactics. A sustainable deficit or maintenance phase can still move body composition in the right direction.",
            "actions": [
                "Prioritize protein, step count, and strength training consistency.",
                "Reduce liquid calories and easy overeating triggers first.",
                "Aim for repeatable weekly progress rather than fast drops.",
            ],
        }

    if category_id == "obesity":
        return {
            "title": "Make the next habit easy",
            "summary": "The most effective plan here is usually one you can repeat under normal life conditions.",
            "actions": [
                "Simplify meals around protein, fiber, and volume foods.",
                "Start with manageable activity targets and build upward.",
                "If health context is complex, treat BMI as one signal and consider professional guidance.",
            ],
        }

    return {
        "title": "Add body metrics to unlock recommendations",
        "summary": "Height and weight are needed before the app can personalize BMI-based guidance.",
        "actions": [
            "Enter your current height.",
            "Log your current body weight.",
            "Refresh the screen to generate personalized guidance.",
        ],
    }


def _interpretation(category_id: str, goal_type: str | None) -> dict:
    goal_label = _goal_label(goal_type)

    if category_id == "underweight":
        body = (
            f"Your BMI suggests you are below the common reference range. For a {goal_label} goal, "
            "the useful next step is usually building consistent nutrition, recovery, and training habits."
        )
    elif category_id == "normal":
        body = (
            f"Your BMI falls inside the common reference range. For a {goal_label} goal, "
            "that usually means the focus can shift toward body composition, performance, and habit quality."
        )
    elif category_id == "overweight":
        body = (
            f"Your BMI is above the common reference range. For a {goal_label} goal, "
            "a steady and realistic plan is more valuable than trying to force rapid change."
        )
    elif category_id == "obesity":
        body = (
            f"Your BMI is well above the common reference range. For a {goal_label} goal, "
            "the most useful path is a repeatable routine that improves nutrition quality, activity, and recovery over time."
        )
    else:
        body = "BMI needs both height and weight before it can be estimated."

    return {
        "title": "How to read this result",
        "body": body,
        "disclaimer": "BMI is a general indicator. It does not directly measure body fat or muscle mass, so treat it as context, not a verdict.",
    }


def build_bmi_summary(user: dict | None) -> dict:
    source = user or {}
    weight = _coerce_number(source.get("weight"))
    height = _coerce_number(source.get("height"))
    bmi_value = calculate_bmi(weight, height)
    category = categorize_bmi(bmi_value)
    healthy_min, healthy_max = healthy_weight_range(height)

    return {
        "bmi": bmi_value,
        "category": category["id"],
        "category_label": category["label"],
        "interpretation": category["short"],
        "weight_kg": _round_weight(weight),
        "height_cm": _round_weight(height),
        "healthy_weight_min_kg": healthy_min,
        "healthy_weight_max_kg": healthy_max,
        "healthy_weight_delta": _healthy_weight_delta(weight, healthy_min, healthy_max),
        "goal_alignment": _goal_alignment(category["id"], source.get("goal_type")),
    }


def _measurement_doc(user_id: str, user: dict, source: str) -> dict | None:
    summary = build_bmi_summary(user)
    if summary["bmi"] is None:
        return None

    return {
        "user_id": user_id,
        "weight_kg": summary["weight_kg"],
        "height_cm": summary["height_cm"],
        "bmi": summary["bmi"],
        "category": summary["category"],
        "goal_type": str(user.get("goal_type") or "recomp"),
        "activity_level": str(user.get("activity_level") or "moderate"),
        "age": user.get("age"),
        "recorded_at": _current_timestamp(),
        "source": source,
    }


def _latest_measurement(db, user_id: str) -> dict | None:
    return db.bmi_history.find_one(
        {"user_id": user_id},
        sort=[("recorded_at", -1), ("_id", -1)],
    )


def sync_bmi_measurement(
    db,
    user_id: str,
    user: dict,
    *,
    source: str = "profile_update",
    force: bool = False,
) -> dict | None:
    measurement = _measurement_doc(user_id, user, source)
    if measurement is None:
        return None

    latest = _latest_measurement(db, user_id)
    if latest and not force:
        same_weight = latest.get("weight_kg") == measurement["weight_kg"]
        same_height = latest.get("height_cm") == measurement["height_cm"]
        if same_weight and same_height:
            return latest

    inserted_id = db.bmi_history.insert_one(measurement).inserted_id
    return db.bmi_history.find_one({"_id": inserted_id})


def serialize_bmi_measurement(entry: dict, previous: dict | None = None) -> dict:
    bmi_value = _coerce_number(entry.get("bmi"))
    weight = _coerce_number(entry.get("weight_kg"))
    previous_bmi = _coerce_number(previous.get("bmi")) if previous else None
    previous_weight = _coerce_number(previous.get("weight_kg")) if previous else None

    return {
        "id": str(entry.get("_id")),
        "recorded_at": str(entry.get("recorded_at") or _current_timestamp()),
        "weight_kg": _round_weight(weight),
        "height_cm": _round_weight(_coerce_number(entry.get("height_cm"))),
        "bmi": bmi_value,
        "category": str(entry.get("category") or categorize_bmi(bmi_value)["id"]),
        "source": str(entry.get("source") or "profile_update"),
        "bmi_change": round(bmi_value - previous_bmi, 1) if bmi_value is not None and previous_bmi is not None else None,
        "weight_change": round(weight - previous_weight, 1)
        if weight is not None and previous_weight is not None
        else None,
    }


def build_bmi_dashboard(db, user: dict) -> dict:
    user_id = str(user["_id"])
    current = build_bmi_summary(user)
    latest = _latest_measurement(db, user_id)

    if current["bmi"] is not None and (
        latest is None
        or latest.get("weight_kg") != current["weight_kg"]
        or latest.get("height_cm") != current["height_cm"]
    ):
        sync_bmi_measurement(db, user_id, user, source="profile_sync")

    history_desc = list(
        db.bmi_history.find(
            {"user_id": user_id},
            sort=[("recorded_at", -1), ("_id", -1)],
            limit=10,
        )
    )
    latest = history_desc[0] if history_desc else None
    previous = history_desc[1] if len(history_desc) > 1 else None
    history = [
        serialize_bmi_measurement(entry, history_desc[index + 1] if index + 1 < len(history_desc) else None)
        for index, entry in enumerate(reversed(history_desc))
    ]

    current["recorded_at"] = str(latest.get("recorded_at")) if latest else None
    current["goal_label"] = _goal_label(user.get("goal_type"))

    bmi_change = None
    weight_change = None
    trend_direction = "stable"

    if latest and previous:
        latest_bmi = _coerce_number(latest.get("bmi"))
        previous_bmi = _coerce_number(previous.get("bmi"))
        latest_weight = _coerce_number(latest.get("weight_kg"))
        previous_weight = _coerce_number(previous.get("weight_kg"))

        if latest_bmi is not None and previous_bmi is not None:
            bmi_change = round(latest_bmi - previous_bmi, 1)
            if bmi_change >= 0.2:
                trend_direction = "up"
            elif bmi_change <= -0.2:
                trend_direction = "down"

        if latest_weight is not None and previous_weight is not None:
            weight_change = round(latest_weight - previous_weight, 1)

    recommendation = _recommendation(current["category"], user.get("goal_type"))
    interpretation = _interpretation(current["category"], user.get("goal_type"))

    return {
        "current": current,
        "profile_snapshot": {
            "weight_kg": current["weight_kg"],
            "height_cm": current["height_cm"],
            "age": user.get("age"),
            "goal_type": str(user.get("goal_type") or "recomp"),
            "goal_label": _goal_label(user.get("goal_type")),
            "activity_level": str(user.get("activity_level") or "moderate"),
        },
        "trend": {
            "direction": trend_direction,
            "bmi_change": bmi_change,
            "weight_change": weight_change,
            "previous_bmi": _coerce_number(previous.get("bmi")) if previous else None,
            "previous_weight_kg": _coerce_number(previous.get("weight_kg")) if previous else None,
            "previous_recorded_at": str(previous.get("recorded_at")) if previous else None,
        },
        "recommendation": recommendation,
        "interpretation": interpretation,
        "limitations": BMI_LIMITATIONS,
        "history": history,
    }
