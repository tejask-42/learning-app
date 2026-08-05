import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useTracking } from '../hooks/useTracking'

export default function Dashboard() {
  const [courses, setCourses] = useState(null)
  const { trackEvent } = useTracking()

  useEffect(() => {
    client.get('/courses').then((res) => setCourses(res.data))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Courses</h1>
        <p>Pick a course to start learning.</p>
      </div>

      {!courses ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="card-list">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="card card-link stack"
              onClick={() =>
                trackEvent('click', {
                  course_id: c.id,
                  payload: { element: 'course_open', course_title: c.title },
                })
              }
            >
              <h2>{c.title}</h2>
              <p>{c.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
