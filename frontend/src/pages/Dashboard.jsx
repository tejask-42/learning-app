import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useTracking } from '../hooks/useTracking'

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const { trackEvent } = useTracking()

  useEffect(() => {
    client.get('/courses').then((res) => setCourses(res.data))
  }, [])

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            <Link
              to={`/courses/${c.id}`}
              onClick={() =>
                trackEvent('click', {
                  course_id: c.id,
                  payload: { element: 'course_open', course_title: c.title },
                })
              }
            >
              {c.title}
            </Link>
            <p>{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
