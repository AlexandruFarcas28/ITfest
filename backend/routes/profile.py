from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.bmi import build_bmi_dashboard, build_bmi_summary, sync_bmi_measurement
    from ..services.user_goals import resolve_user_targets
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.bmi import build_bmi_dashboard, build_bmi_summary, sync_bmi_measurement
    from services.user_goals import resolve_user_targets

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

DECIMAL_FIELDS = {
    "weight",
    "height",
}
INTEGER_FIELDS = {
    "age",
    "daily_calorie_goal",
    "daily_protein_goal",
    "daily_carbs_goal",
    "daily_fats_goal",
    "water_goal_ml",
}
STRING_FIELDS = {"nume", "activity_level", "goal_type"}


def _serialize_profile(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "nume": user.get("nume", ""),
        "email": user.get("email", ""),
        "weight": user.get("weight"),
        "height": user.get("height"),
        "age": user.get("age"),
        "goal_type": user.get("goal_type", "recomp"),
        "activity_level": user.get("activity_level", "moderate"),
        "daily_calorie_goal": user.get("daily_calorie_goal"),
        "daily_protein_goal": user.get("daily_protein_goal"),
        "daily_carbs_goal": user.get("daily_carbs_goal"),
        "daily_fats_goal": user.get("daily_fats_goal"),
        "water_goal_ml": user.get("water_goal_ml"),
        "resolved_targets": resolve_user_targets(user),
        "bmi_summary": build_bmi_summary(user),
    }


def _clean_update_payload(data: dict) -> dict:
    update_fields = {}

    for field in STRING_FIELDS:
        if field not in data:
            continue

        value = str(data.get(field) or "").strip()
        if value:
            update_fields[field] = value.lower() if field == "goal_type" else value

    for field in DECIMAL_FIELDS:
        if field not in data:
            continue

        value = data.get(field)
        if value in ("", None):
            update_fields[field] = None
            continue

        try:
            parsed = round(float(value), 1)
        except (TypeError, ValueError):
            continue

        if parsed <= 0:
            continue

        update_fields[field] = parsed

    for field in INTEGER_FIELDS:
        if field not in data:
            continue

        value = data.get(field)
        if value in ("", None):
            update_fields[field] = None
            continue

        try:
            update_fields[field] = int(float(value))
        except (TypeError, ValueError):
            continue

    return update_fields


@profile_bp.route("", methods=["GET"])
@token_required
def get_profile():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    return jsonify(_serialize_profile(user)), 200


@profile_bp.route("/bmi", methods=["GET"])
@token_required
def get_bmi_dashboard():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    return jsonify(build_bmi_dashboard(mongo.db, user)), 200


@profile_bp.route("", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    update_fields = _clean_update_payload(data)

    if not update_fields:
        return jsonify({"error": "Niciun camp de actualizat"}), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": update_fields},
    )

    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if user and ({"weight", "height"} & set(update_fields.keys())):
        sync_bmi_measurement(mongo.db, request.user_id, user, source="profile_update")
    return jsonify(_serialize_profile(user)), 200
