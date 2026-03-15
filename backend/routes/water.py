from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.gamification import refresh_user_progress
    from ..services.health_data import get_water_snapshot
    from ..services.user_goals import resolve_user_targets
    from ..utils.dates import daterange, today_str
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.gamification import refresh_user_progress
    from services.health_data import get_water_snapshot
    from services.user_goals import resolve_user_targets
    from utils.dates import daterange, today_str

water_bp = Blueprint("water", __name__, url_prefix="/api/water")


def _int_value(value, fallback: int = 0) -> int:
    try:
        return int(float(value or fallback))
    except (TypeError, ValueError):
        return fallback


@water_bp.route("", methods=["GET"])
@token_required
def get_water():
    day = request.args.get("date", today_str())
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    goals = resolve_user_targets(user)
    snapshot = get_water_snapshot(mongo.db, request.user_id, day, goals["water_goal_ml"])
    return jsonify(snapshot), 200


@water_bp.route("", methods=["POST"])
@token_required
def update_water():
    data = request.get_json() or {}
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    goals = resolve_user_targets(user)
    amount_ml = _int_value(data.get("amount_ml"))
    mode = data.get("mode", "add")
    day = data.get("date", today_str())

    existing = mongo.db.water.find_one({"user_id": request.user_id, "date": day})
    current = _int_value((existing or {}).get("amount_ml"))
    new_amount = amount_ml if mode == "set" else max(0, current + amount_ml)

    mongo.db.water.update_one(
        {"user_id": request.user_id, "date": day},
        {"$set": {"amount_ml": new_amount, "goal_ml": goals["water_goal_ml"]}},
        upsert=True,
    )

    progress = refresh_user_progress(mongo.db, request.user_id, user)
    snapshot = get_water_snapshot(mongo.db, request.user_id, day, goals["water_goal_ml"])
    return jsonify({**snapshot, "gamification": progress}), 200


@water_bp.route("/history", methods=["GET"])
@token_required
def get_water_history():
    days = _int_value(request.args.get("days"), 7)
    timeline = daterange(days)
    records = list(
        mongo.db.water.find(
            {"user_id": request.user_id, "date": {"$in": timeline}},
            {"date": 1, "amount_ml": 1, "goal_ml": 1},
        )
    )
    records_map = {record["date"]: record for record in records}

    return jsonify([
        {
            "date": day,
            "amount_ml": _int_value((records_map.get(day) or {}).get("amount_ml")),
            "goal_ml": _int_value((records_map.get(day) or {}).get("goal_ml")),
        }
        for day in timeline
    ]), 200
