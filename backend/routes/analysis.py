import traceback

from flask import Blueprint, jsonify, request

from exceptions import AppError
from services.analysis_pipeline import analyze_cv_upload

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/", methods=["GET"])
def root():
    return jsonify({"message": "QuickHire AI Backend is running"})


@analysis_bp.route("/analyze-cv", methods=["POST"])
def analyze_cv():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    page = request.args.get("page", 1, type=int)

    try:
        payload = analyze_cv_upload(file, page=page)
        return jsonify(payload)
    except AppError as exc:
        return jsonify({"error": exc.message}), exc.status_code
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500
