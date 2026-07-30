import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ddd' }}>
      <Link to="/">Dashboard</Link>
      <span style={{ marginLeft: 'auto' }}>{user.display_name}</span>
      <button onClick={handleLogout}>Log out</button>
    </nav>
  )
}
