import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(email, password, displayName)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h1>{isRegister ? 'Register' : 'Log in'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        {isRegister && (
          <div>
            <label>Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
        )}
        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isRegister ? 'Register' : 'Log in'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
      </button>
      {!isRegister && (
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Demo login: demo1@example.com / password123
        </p>
      )}
    </div>
  )
}
