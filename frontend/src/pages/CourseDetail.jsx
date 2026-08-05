import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import { useTracking } from '../hooks/useTracking'

export default function CourseDetail() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const { trackEvent } = useTracking()

  useEffect(() => {
    client.get(`/courses/${courseId}`).then((res) => setCourse(res.data))
  }, [courseId])

  if (!course) return <p className="loading">Loading...</p>

  return (
    <div className="page">
      <Link to="/" className="back-link">
        &larr; All courses
      </Link>

      <div className="page-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {course.lessons.map((l, i) => (
          <Link
            key={l.id}
            to={`/lessons/${l.id}`}
            className="lesson-row card-link"
            style={{ borderBottom: i < course.lessons.length - 1 ? '1px solid var(--border)' : 'none' }}
            onClick={() =>
              trackEvent('click', {
                course_id: Number(courseId),
                lesson_id: l.id,
                payload: { element: 'lesson_start', lesson_title: l.title },
              })
            }
          >
            <span className="lesson-row-title">{l.title}</span>
            <span className="chevron">&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
