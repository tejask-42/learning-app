from flask import Flask

from app.config import Config
from app.extensions import cors, db, login_manager, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    cors.init_app(app, supports_credentials=True)

    from app import models  # noqa: F401 (ensures models are registered for migrations)
    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.health import health_bp
    from app.routes.quizzes import quizzes_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(quizzes_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import jsonify

        return jsonify(error="login required"), 401

    return app
