from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.gamification import refresh_user_progress
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.gamification import refresh_user_progress

gamification_bp = Blueprint("gamification", __name__, url_prefix="/api/gamification")


@gamification_bp.route("", methods=["GET"])
@token_required
def get_gamification():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    return jsonify(refresh_user_progress(mongo.db, request.user_id, user)), 200
