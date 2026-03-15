import requests
from bson import ObjectId
from flask import Blueprint, jsonify, request

try:
    from ..auth_utils import get_optional_user_id
    from ..db import mongo
    from ..services.meal_coach import generate_meal_coach
except ImportError:
    from auth_utils import get_optional_user_id
    from db import mongo
    from services.meal_coach import generate_meal_coach

meal_ai_bp = Blueprint("meal_ai", __name__)


@meal_ai_bp.route("/ai/estimate-meal", methods=["POST", "OPTIONS"])
def estimate_meal():
    if request.method == "OPTIONS":
        return ("", 204)

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()
    image_mime_type = image_file.mimetype or "image/jpeg"

    if not image_bytes:
        return jsonify({"error": "Empty image"}), 400

    optional_user_id = get_optional_user_id()
    user = None

    if optional_user_id:
        user = mongo.db.users.find_one({"_id": ObjectId(optional_user_id)})

    try:
        return jsonify(generate_meal_coach(mongo.db, image_bytes, image_mime_type, user=user)), 200
    except requests.Timeout:
        return jsonify({
            "error": "Gemini request timed out",
            "details": "Serverul nu a primit raspuns de la model in intervalul asteptat.",
        }), 504
    except requests.RequestException as exc:
        return jsonify({
            "error": "Gemini request could not be completed",
            "details": str(exc),
        }), 502
    except ValueError as exc:
        return jsonify({
            "error": "Meal coach response could not be parsed",
            "details": str(exc),
        }), 500
    except Exception as exc:
        return jsonify({
            "error": "Meal coach integration error",
            "details": str(exc),
        }), 500
