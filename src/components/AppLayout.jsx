import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/littleivy.jpg'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/students', label: 'Students', icon: '🎓' },
  { to: '/email-templates', label: 'Email Templates', icon: '✉️' },
  { to: '/school-info', label: 'School Info', icon: '🏫' },
]

function AppLayout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Little Ivy School logo" className="sidebar-logo-img" />
          <span className="sidebar-brand-text">Little Ivy Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-avatar">
              {(user?.email || '?').charAt(0).toUpperCase()}
            </span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="content-header">
          <h2>{title}</h2>
        </header>
        <main className="content-main">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
