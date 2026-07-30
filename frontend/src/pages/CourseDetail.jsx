import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'

export default function CourseDetail() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)

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
            <Link to={`/lessons/${l.id}`}>{l.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
