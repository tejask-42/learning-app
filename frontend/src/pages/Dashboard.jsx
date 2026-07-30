import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Dashboard() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    client.get('/courses').then((res) => setCourses(res.data))
  }, [])

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            <Link to={`/courses/${c.id}`}>{c.title}</Link>
            <p>{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
