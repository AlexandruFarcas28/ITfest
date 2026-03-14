from flask import Blueprint, jsonify, request
from bson import ObjectId
from db import mongo
from auth_utils import token_required

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")


@profile_bp.route("", methods=["GET"])
@token_required
def get_profile():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    return jsonify({
        "id": str(user["_id"]),
        "nume": user.get("nume", ""),
        "email": user.get("email", ""),
        "weight": user.get("weight", ""),
        "height": user.get("height", ""),
        "age": user.get("age", ""),
    }), 200


@profile_bp.route("", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}

    update_fields = {}
    for field in ["nume", "weight", "height", "age"]:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"error": "Niciun camp de actualizat"}), 400

    mongo.db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": update_fields},
    )

    return jsonify({"message": "Profil actualizat"}), 200
