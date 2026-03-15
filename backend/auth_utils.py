import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId


def generate_token(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=30),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def extract_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    return None


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET"],
        algorithms=["HS256"],
    )


def get_optional_user_id() -> str | None:
    token = extract_bearer_token()
    if not token:
        return None

    try:
        payload = decode_token(token)
    except jwt.InvalidTokenError:
        return None

    return payload.get("sub")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_bearer_token()

        if not token:
            return jsonify({"error": "Token lipsa"}), 401

        try:
            payload = decode_token(token)
            request.user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirat"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token invalid"}), 401

        return f(*args, **kwargs)
    return decorated
