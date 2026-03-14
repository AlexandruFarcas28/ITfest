from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# ─── Incarca .env inainte de orice ────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from db import mongo
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.nutrition import nutrition_bp
from routes.water import water_bp

app = Flask(__name__)
CORS(app)

# ─── Config din .env ──────────────────────────────────────────────────────────
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "fallback_secret")

# ─── Init DB ──────────────────────────────────────────────────────────────────
mongo.init_app(app)

# ─── Blueprints ───────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(nutrition_bp)
app.register_blueprint(water_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
