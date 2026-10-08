import { useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/AppLayout'

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'rejected']
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatLocation(enr) {
  return [enr.city, enr.state].filter(Boolean).join(', ') || '—'
}

function Dashboard() {
  const [enrollments, setEnrollments] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEnrollments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollments`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setEnrollments(data)
    } catch (err) {
      setError(err.message || 'Failed to load enrollments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  async function updateStatus(id, status) {
    const endpoint = status === 'accepted' ? 'accept' : 'reject'
    const previous = enrollments

    // Optimistic update
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    )

    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollments/${id}/${endpoint}`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const updated = await res.json()
      setEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      )
    } catch (err) {
      // Revert on failure
      setEnrollments(previous)
      setError(err.message || 'Failed to update enrollment status')
    }
  }

  const filtered =
    filter === 'all'
      ? enrollments
      : enrollments.filter((e) => e.status === filter)

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
    accepted: enrollments.filter((e) => e.status === 'accepted').length,
    rejected: enrollments.filter((e) => e.status === 'rejected').length,
  }

  return (
    <AppLayout title="Enrollment Requests">
      <div className="filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading && <p className="empty-state">Loading enrollments…</p>}

      {!loading && error && (
        <p className="empty-state">
          Failed to load enrollments: {error}{' '}
          <button className="filter-tab" onClick={fetchEnrollments}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <div className="enrollment-list">
          {filtered.length === 0 && (
            <p className="empty-state">No enrollments in this category.</p>
          )}

          {filtered.map((enr) => (
            <div key={enr.id} className="enrollment-card">
              <div className="enrollment-main">
                <div className="enrollment-id-row">
                  <span className="enrollment-id">{enr.enrollId || enr.id}</span>
                  <span className={`status-badge status-${enr.status}`}>
                    {enr.status}
                  </span>
                </div>

                <div className="enrollment-grid">
                  <div>
                    <strong>Parent</strong>
                    <span className="enrollment-upper">{enr.parentName} ({enr.relation})</span>
                  </div>
                  <div>
                    <strong>Phone</strong>
                    <span>{enr.phoneNumber}</span>
                  </div>
                  <div>
                    <strong>Child</strong>
                    <span className="enrollment-upper">{enr.studentName}</span>
                  </div>
                  <div>
                    <strong>Email</strong>
                    <span>{enr.mailId}</span>
                  </div>
                  <div>
                    <strong>Location</strong>
                    <span>{formatLocation(enr)}</span>
                  </div>
                  <div>
                    <strong>Submitted</strong>
                    <span>{formatDate(enr.startedAt)}</span>
                  </div>
                </div>
              </div>

              {enr.status === 'pending' && (
                <div className="enrollment-actions">
                  <button
                    className="btn-accept"
                    onClick={() => updateStatus(enr.id, 'accepted')}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => updateStatus(enr.id, 'rejected')}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}

export default Dashboard
