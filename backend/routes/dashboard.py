from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.gamification import refresh_user_progress
    from ..services.health_data import build_dashboard
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.gamification import refresh_user_progress
    from services.health_data import build_dashboard

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("", methods=["GET"])
@token_required
def get_dashboard():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    progress = refresh_user_progress(mongo.db, request.user_id, user)
    return jsonify(build_dashboard(mongo.db, user, progress)), 200
