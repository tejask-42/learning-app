from flask import Blueprint, jsonify
from flask_login import login_required
from sqlalchemy import func

from app.extensions import db
from app.models import Event

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api")


@analytics_bp.get("/analytics/summary")
@login_required
def summary():
    counts = (
        db.session.query(Event.event_type, func.count(Event.id))
        .group_by(Event.event_type)
        .all()
    )
    recent = (
        Event.query.order_by(Event.server_timestamp.desc()).limit(20).all()
    )
    return jsonify(
        {
            "counts_by_type": {t: c for t, c in counts},
            "recent_events": [
                {
                    "id": e.id,
                    "event_type": e.event_type,
                    "user_id": e.user_id,
                    "payload": e.payload,
                    "server_timestamp": e.server_timestamp.isoformat() if e.server_timestamp else None,
                }
                for e in recent
            ],
        }
    )
