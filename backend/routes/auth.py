from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from ..auth_utils import generate_token
    from ..db import mongo
    from ..services.user_goals import build_default_user_profile
except ImportError:
    from auth_utils import generate_token
    from db import mongo
    from services.user_goals import build_default_user_profile

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    nume = (data.get("nume") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or data.get("parola") or ""

    if not nume or not email or not password:
        return jsonify({"error": "Toate campurile sunt obligatorii"}), 400

    if len(password) < 6:
        return jsonify({"error": "Parola trebuie sa aiba minim 6 caractere"}), 400

    existing = mongo.db.users.find_one({"email": email})
    if existing:
        return jsonify({"error": "Email-ul este deja folosit"}), 409

    user_id = mongo.db.users.insert_one({
        "nume": nume,
        "email": email,
        "password": generate_password_hash(password),
        **build_default_user_profile(),
    }).inserted_id

    token = generate_token(user_id)
    return jsonify({
        "token": token,
        "user": {"id": str(user_id), "nume": nume, "email": email},
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or data.get("parola") or ""

    if not email or not password:
        return jsonify({"error": "Email si parola sunt obligatorii"}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Email sau parola incorecte"}), 401

    token = generate_token(user["_id"])
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "nume": user["nume"],
            "email": user["email"],
        },
    }), 200


@auth_bp.route("/demo", methods=["POST"])
def demo_login():
    demo_email = "demo@fitapp.com"
    demo_password = "demo1234"

    user = mongo.db.users.find_one({"email": demo_email})
    if not user:
        user_id = mongo.db.users.insert_one({
            "nume": "Demo User",
            "email": demo_email,
            "password": generate_password_hash(demo_password),
            **build_default_user_profile("recomp"),
        }).inserted_id
        user = mongo.db.users.find_one({"_id": user_id})

    token = generate_token(user["_id"])
    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "nume": user["nume"],
            "email": user["email"],
        },
    }), 200
