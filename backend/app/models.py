from datetime import datetime, timezone

from flask_login import UserMixin

from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    lessons = db.relationship("Lesson", backref="course", order_by="Lesson.order_index")


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)

    content_blocks = db.relationship(
        "ContentBlock", backref="lesson", order_by="ContentBlock.order_index"
    )


class ContentBlock(db.Model):
    __tablename__ = "content_blocks"

    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    block_type = db.Column(db.String(20), nullable=False)  # text | video | quiz

    text_content = db.Column(db.Text)
    video_youtube_id = db.Column(db.String(20))
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"))

    quiz = db.relationship("Quiz")


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))

    questions = db.relationship(
        "QuizQuestion", backref="quiz", order_by="QuizQuestion.order_index"
    )


class QuizQuestion(db.Model):
    __tablename__ = "quiz_questions"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)

    options = db.relationship(
        "QuizOption", backref="question", order_by="QuizOption.order_index"
    )


class QuizOption(db.Model):
    __tablename__ = "quiz_options"

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("quiz_questions.id"), nullable=False)
    option_text = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False, default=False)
    order_index = db.Column(db.Integer, nullable=False, default=0)


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    submitted_at = db.Column(db.DateTime(timezone=True), default=utcnow)


class Event(db.Model):
    """Clickstream event log. One generic table with a JSON payload
    rather than a table per event type, since new event types shouldn't
    require a schema migration."""

    __tablename__ = "events"

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    session_id = db.Column(db.String(36), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)

    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"))
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"))
    content_block_id = db.Column(db.Integer, db.ForeignKey("content_blocks.id"))

    payload = db.Column(db.JSON)

    client_timestamp = db.Column(db.DateTime(timezone=True))
    server_timestamp = db.Column(db.DateTime(timezone=True), default=utcnow)


db.Index("ix_events_user_time", Event.user_id, Event.server_timestamp)
