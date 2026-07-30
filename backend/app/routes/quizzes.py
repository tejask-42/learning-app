from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from app.extensions import db
from app.models import Quiz, QuizAttempt, QuizOption

quizzes_bp = Blueprint("quizzes", __name__, url_prefix="/api")


@quizzes_bp.post("/quizzes/<int:quiz_id>/submit")
@login_required
def submit_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    data = request.get_json() or {}
    answers = data.get("answers", [])  # [{question_id, option_id}]

    score = 0
    results = []
    for answer in answers:
        option = QuizOption.query.get(answer.get("option_id"))
        is_correct = bool(option and option.is_correct)
        if is_correct:
            score += 1
        results.append(
            {
                "question_id": answer.get("question_id"),
                "option_id": answer.get("option_id"),
                "is_correct": is_correct,
            }
        )

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        total_questions=len(quiz.questions),
    )
    db.session.add(attempt)
    db.session.commit()

    return jsonify(
        {
            "attempt_id": attempt.id,
            "score": score,
            "total_questions": len(quiz.questions),
            "results": results,
        }
    )
