import os

from dotenv import load_dotenv
from flask import Flask

try:
  from .routes.meal_ai import meal_ai_bp
except ImportError:
  from routes.meal_ai import meal_ai_bp


def create_app():
  load_dotenv()

  app = Flask(__name__)
  app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024

  @app.after_request
  def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

  app.register_blueprint(meal_ai_bp, url_prefix="/api")

  @app.get("/")
  def index():
    return {
      "service": "meal-ai",
      "status": "running",
      "endpoints": [
        "/health",
        "/api/ai/estimate-meal",
      ],
    }

  @app.get("/health")
  def healthcheck():
    return {"status": "ok", "service": "meal-ai"}

  return app


app = create_app()


if __name__ == "__main__":
  app.run(host=os.getenv("FLASK_HOST", "0.0.0.0"), port=int(os.getenv("PORT", "5000")), debug=True)
