from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from app.extensions import db
from app.models import Event

events_bp = Blueprint("events", __name__, url_prefix="/api")

ALLOWED_EVENT_TYPES = {
    "page_view",
    "click",
    "video_play",
    "video_pause",
    "video_seek",
    "video_complete",
    "quiz_started",
    "quiz_answer_submitted",
    "quiz_completed",
}


def parse_client_timestamp(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


@events_bp.post("/events")
@login_required
def ingest_events():
    data = request.get_json() or {}
    events = data if isinstance(data, list) else data.get("events", [])

    rows = []
    for e in events:
        event_type = e.get("event_type")
        if event_type not in ALLOWED_EVENT_TYPES:
            continue
        rows.append(
            Event(
                user_id=current_user.id,
                session_id=e.get("session_id", ""),
                event_type=event_type,
                course_id=e.get("course_id"),
                lesson_id=e.get("lesson_id"),
                content_block_id=e.get("content_block_id"),
                payload=e.get("payload"),
                client_timestamp=parse_client_timestamp(e.get("client_timestamp")),
                server_timestamp=datetime.now(timezone.utc),
            )
        )

    db.session.bulk_save_objects(rows)
    db.session.commit()

    return jsonify(accepted=len(rows)), 201
