import os

from dotenv import load_dotenv
from flask import Flask

try:
  from .db import mongo
  from .routes.auth import auth_bp
  from .routes.meal_ai import meal_ai_bp
  from .routes.nutrition import nutrition_bp
  from .routes.profile import profile_bp
  from .routes.water import water_bp
except ImportError:
  from db import mongo
  from routes.auth import auth_bp
  from routes.meal_ai import meal_ai_bp
  from routes.nutrition import nutrition_bp
  from routes.profile import profile_bp
  from routes.water import water_bp


def create_app():
  load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

  app = Flask(__name__)
  app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
  app.config["MONGO_URI"] = os.getenv("MONGO_URI")
  app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "fallback_secret")
  app.config["DB_INIT_ERROR"] = None

  if app.config["MONGO_URI"]:
    try:
      mongo.init_app(app)
    except Exception as exc:
      app.config["DB_INIT_ERROR"] = str(exc)
  else:
    app.config["DB_INIT_ERROR"] = "MONGO_URI is not configured."

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


app = create_app()


if __name__ == "__main__":
  app.run(
    host=os.getenv("FLASK_HOST", "0.0.0.0"),
    port=int(os.getenv("PORT", "5000")),
    debug=True,
  )
