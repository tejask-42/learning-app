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
    from app.routes.health import health_bp

    app.register_blueprint(health_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))

    return app
