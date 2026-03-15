from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import token_required
    from ..db import mongo
    from ..services.health_data import build_weekly_insights
except ImportError:
    from auth_utils import token_required
    from db import mongo
    from services.health_data import build_weekly_insights

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")


@insights_bp.route("/weekly", methods=["GET"])
@token_required
def get_weekly_insights():
    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User negasit"}), 404

    return jsonify(build_weekly_insights(mongo.db, user)), 200
