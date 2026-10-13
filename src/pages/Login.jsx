import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/littleivy-logo-new.jpeg'

function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setInfo('')
    setPassword('')
    setConfirmPassword('')
    setRequestSubmitted(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const result = await login(email, password)
      setLoading(false)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } else {
      const result = await signup(email, password)
      setLoading(false)
      if (result.success) {
        setInfo(result.message)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setRequestSubmitted(true)
      } else {
        setError(result.error)
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="Little Ivy School logo" className="login-logo-img" />
          <h1>Little Ivy Admin</h1>
          <p>{mode === 'login' ? 'Sign in to manage enrollment requests' : 'Request access to the admin portal'}</p>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="admin@littleivy.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'signup' && (
            <>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </>
          )}

          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}

          <button type="submit" className="login-btn" disabled={loading || requestSubmitted}>
            {mode === 'signup' && requestSubmitted
              ? 'Request Submitted'
              : loading
                ? mode === 'login'
                  ? 'Signing in…'
                  : 'Submitting…'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Request Access'}
          </button>
        </form>

        <p className="login-footer">
          {mode === 'login'
            ? 'Authorized admins only'
            : 'Your request will be sent to the administrator for approval'}
        </p>
      </div>
    </div>
  )
}

export default Login

