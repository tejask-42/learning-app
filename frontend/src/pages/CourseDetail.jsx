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

  if (!course) return <p>Loading...</p>

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <ul>
        {course.lessons.map((l) => (
          <li key={l.id}>
            <Link
              to={`/lessons/${l.id}`}
              onClick={() =>
                trackEvent('click', {
                  course_id: Number(courseId),
                  lesson_id: l.id,
                  payload: { element: 'lesson_start', lesson_title: l.title },
                })
              }
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
