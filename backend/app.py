from flask import Flask
from flask_cors import CORS
from db import mongo
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.nutrition import nutrition_bp
from routes.water import water_bp

app = Flask(__name__)
CORS(app)

# ─── Config ───────────────────────────────────────────────────────────────────
app.config["MONGO_URI"] = "mongodb://localhost:27017/fitapp"
app.config["JWT_SECRET"] = "SCHIMBA_ASTA_CU_UN_SECRET_RANDOM"

# ─── Init DB ──────────────────────────────────────────────────────────────────
mongo.init_app(app)

# ─── Blueprints ───────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(nutrition_bp)
app.register_blueprint(water_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
