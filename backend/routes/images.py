from flask import Blueprint, jsonify, make_response

try:
    from ..db import mongo
    from ..services.image_storage import get_stored_image
except ImportError:
    from db import mongo
    from services.image_storage import get_stored_image

images_bp = Blueprint("images", __name__, url_prefix="/api/images")


@images_bp.route("/<image_id>", methods=["GET"])
def get_image(image_id):
    try:
        grid_file = get_stored_image(mongo.db, image_id)
    except ValueError:
        return jsonify({"error": "Invalid image id"}), 400
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404

    response = make_response(grid_file.read())
    response.headers["Content-Type"] = getattr(grid_file, "content_type", None) or "application/octet-stream"
    response.headers["Content-Length"] = str(grid_file.length)
    response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response
