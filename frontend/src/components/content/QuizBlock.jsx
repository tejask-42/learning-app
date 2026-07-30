import { useState } from 'react'
import client from '../../api/client'

export default function QuizBlock({ block }) {
  const quiz = block.quiz
  const [selected, setSelected] = useState({}) // question_id -> option_id
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function selectOption(questionId, optionId) {
    if (result) return
    setSelected((prev) => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const answers = quiz.questions.map((q) => ({
      question_id: q.id,
      option_id: selected[q.id],
    }))
    const res = await client.post(`/quizzes/${quiz.id}/submit`, { answers })
    setResult(res.data)
    setSubmitting(false)
  }

  const allAnswered = quiz.questions.every((q) => selected[q.id])

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', maxWidth: 640 }}>
      <h3>{quiz.title}</h3>
      {quiz.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: '1rem' }}>
          <p>{q.question_text}</p>
          {q.options.map((o) => {
            const resultInfo = result?.results.find((r) => r.question_id === q.id)
            const isSelected = selected[q.id] === o.id
            let color = undefined
            if (result && isSelected) {
              color = resultInfo?.is_correct ? 'green' : 'red'
            }
            return (
              <label key={o.id} style={{ display: 'block', color }}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={isSelected}
                  onChange={() => selectOption(q.id, o.id)}
                  disabled={!!result}
                />
                {o.option_text}
              </label>
            )
          })}
        </div>
      ))}
      {!result ? (
        <button onClick={handleSubmit} disabled={!allAnswered || submitting}>
          Submit
        </button>
      ) : (
        <p>
          Score: {result.score} / {result.total_questions}
        </p>
      )}
    </div>
  )
}
