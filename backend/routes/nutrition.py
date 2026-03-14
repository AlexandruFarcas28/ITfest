from datetime import datetime, date
from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
except ImportError:
    from auth_utils import token_required
    from db import mongo

nutrition_bp = Blueprint("nutrition", __name__, url_prefix="/api/nutrition")


def today_str():
    return date.today().isoformat()  # "2026-03-14"


@nutrition_bp.route("", methods=["GET"])
@token_required
def get_nutrition():
    """Returneaza toate intrarile de azi."""
    day = request.args.get("date", today_str())

    entries = list(mongo.db.nutrition.find({
        "user_id": request.user_id,
        "date": day,
    }))

    for e in entries:
        e["id"] = str(e.pop("_id"))

    total_calories = sum(e.get("calories", 0) for e in entries)

    return jsonify({
        "date": day,
        "entries": entries,
        "total_calories": total_calories,
    }), 200


@nutrition_bp.route("", methods=["POST"])
@token_required
def add_nutrition():
    """Adauga o intrare noua."""
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    calories = int(data.get("calories") or 0)

    if not name:
        return jsonify({"error": "Numele mancaruri este obligatoriu"}), 400

    entry = {
        "user_id": request.user_id,
        "date": data.get("date", today_str()),
        "name": name,
        "calories": calories,
        "protein": int(data.get("protein") or 0),
        "carbs": int(data.get("carbs") or 0),
        "fats": int(data.get("fats") or 0),
        "source": data.get("source", "manual"),  # "manual" sau "ai_scan"
        "created_at": datetime.utcnow().isoformat(),
    }

    inserted_id = mongo.db.nutrition.insert_one(entry).inserted_id
    entry["id"] = str(inserted_id)
    entry.pop("_id", None)

    return jsonify(entry), 201


@nutrition_bp.route("/<entry_id>", methods=["DELETE"])
@token_required
def delete_nutrition(entry_id):
    """Sterge o intrare."""
    result = mongo.db.nutrition.delete_one({
        "_id": ObjectId(entry_id),
        "user_id": request.user_id,
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Intrarea nu a fost gasita"}), 404

    return jsonify({"message": "Sters"}), 200


@nutrition_bp.route("/history", methods=["GET"])
@token_required
def get_history():
    """Returneaza totalul de calorii pe ultimele 7 zile."""
    pipeline = [
        {"$match": {"user_id": request.user_id}},
        {"$group": {
            "_id": "$date",
            "total_calories": {"$sum": "$calories"},
        }},
        {"$sort": {"_id": -1}},
        {"$limit": 7},
    ]
    results = list(mongo.db.nutrition.aggregate(pipeline))
    return jsonify([
        {"date": r["_id"], "total_calories": r["total_calories"]}
        for r in results
    ]), 200
