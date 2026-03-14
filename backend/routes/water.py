from datetime import date
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
except ImportError:
    from auth_utils import token_required
    from db import mongo

water_bp = Blueprint("water", __name__, url_prefix="/api/water")


def today_str():
    return date.today().isoformat()


@water_bp.route("", methods=["GET"])
@token_required
def get_water():
    """Returneaza cantitatea de apa de azi."""
    day = request.args.get("date", today_str())

    record = mongo.db.water.find_one({
        "user_id": request.user_id,
        "date": day,
    })

    return jsonify({
        "date": day,
        "amount_ml": record["amount_ml"] if record else 0,
        "goal_ml": 2500,
    }), 200


@water_bp.route("", methods=["POST"])
@token_required
def update_water():
    """Seteaza sau adauga apa pentru azi."""
    data = request.get_json() or {}
    amount_ml = int(data.get("amount_ml") or 0)
    mode = data.get("mode", "add")  # "add" sau "set"
    day = data.get("date", today_str())

    existing = mongo.db.water.find_one({
        "user_id": request.user_id,
        "date": day,
    })

    if mode == "set":
        new_amount = amount_ml
    else:
        current = existing["amount_ml"] if existing else 0
        new_amount = max(0, current + amount_ml)

    mongo.db.water.update_one(
        {"user_id": request.user_id, "date": day},
        {"$set": {"amount_ml": new_amount, "goal_ml": 2500}},
        upsert=True,
    )

    return jsonify({
        "date": day,
        "amount_ml": new_amount,
        "goal_ml": 2500,
    }), 200


@water_bp.route("/history", methods=["GET"])
@token_required
def get_water_history():
    """Returneaza istoricul de hidratare pe ultimele 7 zile."""
    records = list(mongo.db.water.find(
        {"user_id": request.user_id},
        sort=[("date", -1)],
        limit=7,
    ))

    return jsonify([
        {"date": r["date"], "amount_ml": r["amount_ml"]}
        for r in records
    ]), 200
