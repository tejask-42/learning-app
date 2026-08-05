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
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Learning App
      </Link>
      <Link to="/" className="nav-link">
        Courses
      </Link>
      <Link to="/admin" className="nav-link">
        Activity
      </Link>
      <div className="navbar-spacer">
        <span className="navbar-user">{user.display_name}</span>
        <button onClick={handleLogout} className="btn btn-ghost">
          Log out
        </button>
      </div>
    </nav>
  )
}
