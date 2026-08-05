import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import QuizBlock from '../components/content/QuizBlock'
import TextBlock from '../components/content/TextBlock'
import VideoBlock from '../components/content/VideoBlock'

export default function Lesson() {
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState(null)

  useEffect(() => {
    client.get(`/lessons/${lessonId}`).then((res) => setLesson(res.data))
  }, [lessonId])

  if (!lesson) return <p className="loading">Loading...</p>

  return (
    <div className="page">
      <Link to={`/courses/${lesson.course_id}`} className="back-link">
        &larr; Back to course
      </Link>

      <div className="page-header">
        <h1>{lesson.title}</h1>
      </div>

      <div className="stack">
        {lesson.content_blocks.map((block) => {
          if (block.block_type === 'text')
            return (
              <div key={block.id} className="card content-block">
                <TextBlock block={block} />
              </div>
            )
          if (block.block_type === 'video')
            return (
              <div key={block.id} className="content-block">
                <VideoBlock block={block} />
              </div>
            )
          if (block.block_type === 'quiz')
            return (
              <div key={block.id} className="card content-block">
                <QuizBlock block={block} />
              </div>
            )
          return null
        })}
      </div>
    </div>
  )
}
