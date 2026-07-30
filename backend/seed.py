"""Populate the database with a couple of demo courses and demo learner accounts.
Safe to re-run: clears and re-inserts seed data each time."""

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import ContentBlock, Course, Event, Lesson, Quiz, QuizAttempt, QuizOption, QuizQuestion, User

DEMO_USERS = [
    {"email": "demo1@example.com", "password": "password123", "display_name": "Demo Learner 1"},
    {"email": "demo2@example.com", "password": "password123", "display_name": "Demo Learner 2"},
]


def make_quiz(title, questions):
    quiz = Quiz(title=title)
    db.session.add(quiz)
    db.session.flush()

    for i, (text, options) in enumerate(questions):
        question = QuizQuestion(quiz_id=quiz.id, question_text=text, order_index=i)
        db.session.add(question)
        db.session.flush()
        for j, (option_text, is_correct) in enumerate(options):
            db.session.add(
                QuizOption(
                    question_id=question.id,
                    option_text=option_text,
                    is_correct=is_correct,
                    order_index=j,
                )
            )
    return quiz


def seed():
    # clear existing seed data (order matters due to FKs)
    Event.query.delete()
    QuizAttempt.query.delete()
    ContentBlock.query.delete()
    QuizOption.query.delete()
    QuizQuestion.query.delete()
    Quiz.query.delete()
    Lesson.query.delete()
    Course.query.delete()
    User.query.delete()
    db.session.commit()

    for u in DEMO_USERS:
        db.session.add(
            User(
                email=u["email"],
                password_hash=generate_password_hash(u["password"]),
                display_name=u["display_name"],
            )
        )

    # Course 1: Intro to Python Programming
    course1 = Course(
        title="Intro to Python Programming",
        description="A short introduction to Python basics.",
    )
    db.session.add(course1)
    db.session.flush()

    lesson1 = Lesson(course_id=course1.id, title="What is Python?", order_index=0)
    db.session.add(lesson1)
    db.session.flush()
    db.session.add_all(
        [
            ContentBlock(
                lesson_id=lesson1.id,
                order_index=0,
                block_type="text",
                text_content=(
                    "Python is a popular, easy-to-read programming language used for "
                    "web development, data analysis, automation, and more."
                ),
            ),
            ContentBlock(
                lesson_id=lesson1.id,
                order_index=1,
                block_type="video",
                video_youtube_id="rfscVS0vtbw",  # freeCodeCamp Python intro
            ),
        ]
    )
    quiz1 = make_quiz(
        "What is Python? Quiz",
        [
            (
                "Python is best described as a...",
                [("Programming language", True), ("Type of snake only", False), ("Web browser", False)],
            ),
            (
                "Python is known for being...",
                [("Hard to read", False), ("Easy to read", True), ("Only for beginners", False)],
            ),
        ],
    )
    db.session.flush()
    db.session.add(
        ContentBlock(lesson_id=lesson1.id, order_index=2, block_type="quiz", quiz_id=quiz1.id)
    )

    lesson2 = Lesson(course_id=course1.id, title="Variables and Data Types", order_index=1)
    db.session.add(lesson2)
    db.session.flush()
    db.session.add(
        ContentBlock(
            lesson_id=lesson2.id,
            order_index=0,
            block_type="text",
            text_content=(
                "Variables store data. Python has several built-in types: int, float, "
                "str, and bool are the most common."
            ),
        )
    )
    quiz2 = make_quiz(
        "Variables Quiz",
        [
            (
                "Which of these is a Python data type?",
                [("str", True), ("word", False), ("txt", False)],
            ),
        ],
    )
    db.session.flush()
    db.session.add(
        ContentBlock(lesson_id=lesson2.id, order_index=1, block_type="quiz", quiz_id=quiz2.id)
    )

    # Course 2: Study Skills
    course2 = Course(
        title="Study Skills & Productivity",
        description="Quick tips for learning effectively.",
    )
    db.session.add(course2)
    db.session.flush()

    lesson3 = Lesson(course_id=course2.id, title="Active Recall", order_index=0)
    db.session.add(lesson3)
    db.session.flush()
    db.session.add_all(
        [
            ContentBlock(
                lesson_id=lesson3.id,
                order_index=0,
                block_type="text",
                text_content=(
                    "Active recall means testing yourself on material instead of just "
                    "re-reading it. It's one of the most effective study techniques."
                ),
            ),
            ContentBlock(
                lesson_id=lesson3.id,
                order_index=1,
                block_type="video",
                video_youtube_id="ukLnPbIffxE",  # study technique explainer
            ),
        ]
    )
    quiz3 = make_quiz(
        "Active Recall Quiz",
        [
            (
                "Active recall works by...",
                [("Re-reading notes passively", False), ("Testing yourself on the material", True)],
            ),
        ],
    )
    db.session.flush()
    db.session.add(
        ContentBlock(lesson_id=lesson3.id, order_index=2, block_type="quiz", quiz_id=quiz3.id)
    )

    db.session.commit()
    print("Seed complete: 2 courses, 3 lessons, 3 quizzes, 2 demo users.")
    print("Demo logins:")
    for u in DEMO_USERS:
        print(f"  {u['email']} / {u['password']}")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed()
