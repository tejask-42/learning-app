from flask import Blueprint, jsonify
from flask_login import login_required

from app.models import Course, Lesson

courses_bp = Blueprint("courses", __name__, url_prefix="/api")


def content_block_to_dict(block):
    data = {"id": block.id, "order_index": block.order_index, "block_type": block.block_type}

    if block.block_type == "text":
        data["text_content"] = block.text_content
    elif block.block_type == "video":
        data["video_youtube_id"] = block.video_youtube_id
    elif block.block_type == "quiz":
        data["quiz"] = {
            "id": block.quiz.id,
            "title": block.quiz.title,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "options": [{"id": o.id, "option_text": o.option_text} for o in q.options],
                }
                for q in block.quiz.questions
            ],
        }

    return data


@courses_bp.get("/courses")
@login_required
def list_courses():
    courses = Course.query.order_by(Course.id).all()
    return jsonify(
        [{"id": c.id, "title": c.title, "description": c.description} for c in courses]
    )


@courses_bp.get("/courses/<int:course_id>")
@login_required
def get_course(course_id):
    course = Course.query.get_or_404(course_id)
    return jsonify(
        {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "lessons": [{"id": l.id, "title": l.title} for l in course.lessons],
        }
    )


@courses_bp.get("/lessons/<int:lesson_id>")
@login_required
def get_lesson(lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    return jsonify(
        {
            "id": lesson.id,
            "title": lesson.title,
            "course_id": lesson.course_id,
            "content_blocks": [content_block_to_dict(b) for b in lesson.content_blocks],
        }
    )
