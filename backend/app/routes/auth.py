from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def user_to_dict(user):
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    display_name = data.get("display_name", "").strip()

    if not email or not password or not display_name:
        return jsonify(error="email, password, and display_name are required"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(error="an account with that email already exists"), 409

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        display_name=display_name,
    )
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify(user_to_dict(user)), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(error="invalid email or password"), 401

    login_user(user)
    return jsonify(user_to_dict(user))


@auth_bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify(message="logged out")


@auth_bp.get("/me")
def me():
    if not current_user.is_authenticated:
        return jsonify(error="not logged in"), 401
    return jsonify(user_to_dict(current_user))
