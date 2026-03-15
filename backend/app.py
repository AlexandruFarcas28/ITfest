import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from flask import Flask, jsonify, request

try:
  from .db import mongo
  from .routes.auth import auth_bp
  from .routes.dashboard import dashboard_bp
  from .routes.gamification import gamification_bp
  from .routes.insights import insights_bp
  from .routes.meal_ai import meal_ai_bp
  from .routes.nutrition import nutrition_bp
  from .routes.profile import profile_bp
  from .routes.water import water_bp
except ImportError:
  from db import mongo
  from routes.auth import auth_bp
  from routes.dashboard import dashboard_bp
  from routes.gamification import gamification_bp
  from routes.insights import insights_bp
  from routes.meal_ai import meal_ai_bp
  from routes.nutrition import nutrition_bp
  from routes.profile import profile_bp
  from routes.water import water_bp


def create_app():
  load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

  app = Flask(__name__)
  app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
  app.config["MONGO_URI"] = _build_mongo_uri_with_timeouts(os.getenv("MONGO_URI"))
  app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "fallback_secret")
  app.config["DB_INIT_ERROR"] = None

  if app.config["MONGO_URI"]:
    try:
      mongo.init_app(app)
      with app.app_context():
        mongo.cx.admin.command("ping")
    except Exception as exc:
      app.config["DB_INIT_ERROR"] = str(exc)
  else:
    app.config["DB_INIT_ERROR"] = "MONGO_URI is not configured."

  @app.before_request
  def fail_fast_when_database_is_unavailable():
    if request.method == "OPTIONS":
      return None

    if request.path in {"/", "/health"}:
      return None

    if request.path.startswith("/api") and app.config["DB_INIT_ERROR"]:
      return jsonify({
        "error": "Database unavailable",
        "details": app.config["DB_INIT_ERROR"],
      }), 503

  @app.after_request
  def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

  app.register_blueprint(auth_bp)
  app.register_blueprint(profile_bp)
  app.register_blueprint(nutrition_bp)
  app.register_blueprint(water_bp)
  app.register_blueprint(dashboard_bp)
  app.register_blueprint(insights_bp)
  app.register_blueprint(gamification_bp)
  app.register_blueprint(meal_ai_bp, url_prefix="/api")

  @app.get("/")
  def index():
    return {
      "service": "fitapp-backend",
      "status": "running",
      "database": "degraded" if app.config["DB_INIT_ERROR"] else "connected",
      "endpoints": [
        "/health",
        "/api/auth/login",
        "/api/auth/register",
        "/api/profile",
        "/api/nutrition",
        "/api/water",
        "/api/dashboard",
        "/api/insights/weekly",
        "/api/gamification",
        "/api/ai/estimate-meal",
      ],
    }

  @app.get("/health")
  def healthcheck():
    return {
      "status": "ok",
      "service": "fitapp-backend",
      "database": "degraded" if app.config["DB_INIT_ERROR"] else "connected",
      "database_error": app.config["DB_INIT_ERROR"],
    }

  return app


def _build_mongo_uri_with_timeouts(raw_uri: str | None) -> str | None:
  if not raw_uri:
    return None

  parsed = urlparse(raw_uri)
  query = dict(parse_qsl(parsed.query, keep_blank_values=True))
  query.setdefault(
    "serverSelectionTimeoutMS",
    os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "4000"),
  )
  query.setdefault(
    "connectTimeoutMS",
    os.getenv("MONGO_CONNECT_TIMEOUT_MS", "4000"),
  )
  query.setdefault(
    "socketTimeoutMS",
    os.getenv("MONGO_SOCKET_TIMEOUT_MS", "8000"),
  )

  return urlunparse(parsed._replace(query=urlencode(query)))


app = create_app()


if __name__ == "__main__":
  app.run(
    host=os.getenv("FLASK_HOST", "0.0.0.0"),
    port=int(os.getenv("PORT", "5000")),
    debug=True,
  )
