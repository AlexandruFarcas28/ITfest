from datetime import datetime

from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.gamification import refresh_user_progress
    from ..services.health_data import (
        build_goal_progress,
        build_meal_history,
        list_entries_for_day,
        serialize_meal,
        sum_entries,
    )
    from ..services.user_goals import resolve_user_targets
    from ..utils.dates import today_str
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.gamification import refresh_user_progress
    from services.health_data import (
        build_goal_progress,
        build_meal_history,
        list_entries_for_day,
        serialize_meal,
        sum_entries,
    )
    from services.user_goals import resolve_user_targets
    from utils.dates import today_str

nutrition_bp = Blueprint("nutrition", __name__, url_prefix="/api/nutrition")


def _int_field(data: dict, key: str, fallback: int = 0) -> int:
    try:
        return int(float(data.get(key, fallback) or fallback))
    except (TypeError, ValueError):
        return fallback


def _build_entry_payload(data: dict, user_id: str, existing: dict | None = None) -> dict:
    now = datetime.utcnow().isoformat()
    base = existing or {}
    name = (data.get("name") or base.get("name") or "").strip()

    return {
        "user_id": user_id,
        "date": data.get("date") or base.get("date") or today_str(),
        "name": name,
        "meal_type": (data.get("meal_type") or base.get("meal_type") or "").strip().lower() or None,
        "calories": _int_field(data, "calories", int(base.get("calories") or 0)),
        "protein": _int_field(data, "protein", int(base.get("protein") or 0)),
        "carbs": _int_field(data, "carbs", int(base.get("carbs") or 0)),
        "fats": _int_field(data, "fats", int(base.get("fats") or 0)),
        "source": str(data.get("source") or base.get("source") or "manual"),
        "favorite": bool(data.get("favorite", base.get("favorite", False))),
        "repeatable": bool(data.get("repeatable", base.get("repeatable", True))),
        "image_uri": data.get("image_uri") or base.get("image_uri"),
        "analysis_mode": data.get("analysis_mode") or base.get("analysis_mode") or "manual",
        "detected_foods": list(data.get("detected_foods") or base.get("detected_foods") or []),
        "ai_description": data.get("ai_description") or base.get("ai_description"),
        "ai_confidence": data.get("ai_confidence") or base.get("ai_confidence"),
        "confidence_reason": data.get("confidence_reason") or base.get("confidence_reason"),
        "goal_comparison": data.get("goal_comparison") or base.get("goal_comparison"),
        "improvement_suggestions": list(
            data.get("improvement_suggestions") or base.get("improvement_suggestions") or []
        ),
        "later_meal_suggestion": data.get("later_meal_suggestion") or base.get("later_meal_suggestion"),
        "notes": data.get("notes") or base.get("notes"),
        "created_at": base.get("created_at") or data.get("created_at") or now,
        "updated_at": now,
    }


def _apply_corrections(existing: dict, incoming: dict, data: dict) -> dict:
    corrections = existing.get("user_corrections") or {}
    changed_fields = {}

    for field in ["name", "calories", "protein", "carbs", "fats"]:
        if field in data and incoming.get(field) != existing.get(field):
            changed_fields[field] = incoming.get(field)

    correction_note = (data.get("correction_note") or "").strip()
    if correction_note:
        changed_fields["note"] = correction_note

    if not changed_fields:
        return corrections or None

    return {
        **corrections,
        **changed_fields,
        "updated_at": datetime.utcnow().isoformat(),
    }


@nutrition_bp.route("", methods=["GET"])
@token_required
def get_nutrition():
    day = request.args.get("date", today_str())
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    entries = [serialize_meal(entry) for entry in list_entries_for_day(mongo.db, request.user_id, day)]
    totals = sum_entries(entries)
    goals = resolve_user_targets(user)

    return jsonify({
        "date": day,
        "entries": entries,
        "totals": totals,
        "goals": goals,
        "progress": {
            "calories": build_goal_progress(totals["calories"], goals["daily_calorie_goal"]),
            "protein": build_goal_progress(totals["protein"], goals["daily_protein_goal"]),
            "carbs": build_goal_progress(totals["carbs"], goals["daily_carbs_goal"]),
            "fats": build_goal_progress(totals["fats"], goals["daily_fats_goal"]),
        },
    }), 200


@nutrition_bp.route("", methods=["POST"])
@token_required
def add_nutrition():
    data = request.get_json() or {}
    entry = _build_entry_payload(data, request.user_id)

    if not entry["name"]:
        return jsonify({"error": "Numele mancaruri este obligatoriu"}), 400

    inserted_id = mongo.db.nutrition.insert_one(entry).inserted_id
    created = mongo.db.nutrition.find_one({"_id": inserted_id})
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    progress = refresh_user_progress(mongo.db, request.user_id, user)

    return jsonify({
        "entry": serialize_meal(created),
        "gamification": progress,
    }), 201


@nutrition_bp.route("/<entry_id>", methods=["PUT"])
@token_required
def update_nutrition(entry_id):
    data = request.get_json() or {}
    existing = mongo.db.nutrition.find_one({
        "_id": ObjectId(entry_id),
        "user_id": request.user_id,
    })

    if not existing:
        return jsonify({"error": "Intrarea nu a fost gasita"}), 404

    updated = _build_entry_payload(data, request.user_id, existing=existing)
    if not updated["name"]:
        return jsonify({"error": "Numele mancaruri este obligatoriu"}), 400

    updated["user_corrections"] = _apply_corrections(existing, updated, data)

    mongo.db.nutrition.update_one(
        {"_id": ObjectId(entry_id), "user_id": request.user_id},
        {"$set": updated},
    )

    refreshed = mongo.db.nutrition.find_one({"_id": ObjectId(entry_id)})
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    progress = refresh_user_progress(mongo.db, request.user_id, user)

    return jsonify({
        "entry": serialize_meal(refreshed),
        "gamification": progress,
    }), 200


@nutrition_bp.route("/<entry_id>/repeat", methods=["POST"])
@token_required
def repeat_nutrition(entry_id):
    existing = mongo.db.nutrition.find_one({
        "_id": ObjectId(entry_id),
        "user_id": request.user_id,
    })

    if not existing:
        return jsonify({"error": "Intrarea nu a fost gasita"}), 404

    clone = {key: value for key, value in existing.items() if key != "_id"}
    now = datetime.utcnow().isoformat()
    clone.update({
        "date": today_str(),
        "source": "repeat",
        "created_at": now,
        "updated_at": now,
    })

    inserted_id = mongo.db.nutrition.insert_one(clone).inserted_id
    created = mongo.db.nutrition.find_one({"_id": inserted_id})
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    progress = refresh_user_progress(mongo.db, request.user_id, user)

    return jsonify({
        "entry": serialize_meal(created),
        "gamification": progress,
    }), 201


@nutrition_bp.route("/<entry_id>", methods=["DELETE"])
@token_required
def delete_nutrition(entry_id):
    result = mongo.db.nutrition.delete_one({
        "_id": ObjectId(entry_id),
        "user_id": request.user_id,
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Intrarea nu a fost gasita"}), 404

    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    progress = refresh_user_progress(mongo.db, request.user_id, user)
    return jsonify({"message": "Sters", "gamification": progress}), 200


@nutrition_bp.route("/history", methods=["GET"])
@token_required
def get_history():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    days = _int_field(request.args, "days", 14)
    limit = _int_field(request.args, "limit", 30)
    return jsonify(build_meal_history(mongo.db, user, days=days, limit=limit)), 200
