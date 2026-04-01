from flask import Flask
from flask_cors import CORS

from routes.analysis import analysis_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(analysis_bp)
    return app
