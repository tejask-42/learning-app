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

  if (!lesson) return <p>Loading...</p>

  return (
    <div>
      <Link to={`/courses/${lesson.course_id}`}>&larr; Back to course</Link>
      <h1>{lesson.title}</h1>
      {lesson.content_blocks.map((block) => {
        if (block.block_type === 'text') return <TextBlock key={block.id} block={block} />
        if (block.block_type === 'video') return <VideoBlock key={block.id} block={block} />
        if (block.block_type === 'quiz') return <QuizBlock key={block.id} block={block} />
        return null
      })}
    </div>
  )
}
