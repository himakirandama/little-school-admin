import { useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/AppLayout'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatLocation(s) {
  return [s.city, s.state].filter(Boolean).join(', ') || '—'
}

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/accepted-students`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filtered = students
    .filter((s) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        s.studentName?.toLowerCase().includes(q) ||
        s.parentName?.toLowerCase().includes(q) ||
        s.admissionId?.toLowerCase().includes(q) ||
        s.enrollId?.toLowerCase().includes(q) ||
        s.mailId?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) =>
      (a.admissionId || '').localeCompare(b.admissionId || '', undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    )

  return (
    <AppLayout title="Students">
      <div className="students-toolbar">
        <input
          type="text"
          placeholder="Search by name, admission ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="students-search"
        />
        <span className="students-count">{filtered.length} admitted student(s)</span>
      </div>

      {loading && <p className="empty-state">Loading students…</p>}

      {!loading && error && (
        <p className="empty-state">
          Failed to load students: {error}{' '}
          <button className="filter-tab" onClick={fetchStudents}>
            Retry
          </button>
        </p>
      )}

      {!loading && !error && (
        <div className="students-table-wrapper">
          {filtered.length === 0 ? (
            <p className="empty-state">No admitted students yet.</p>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Student Name</th>
                  <th>Parent / Guardian</th>
                  <th>Relation</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Joined On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.admissionId}>
                    <td className="students-id-cell">{s.admissionId}</td>
                    <td className="students-upper">{s.studentName}</td>
                    <td className="students-upper">{s.parentName}</td>
                    <td className="students-upper">{s.relation}</td>
                    <td>{s.mailId}</td>
                    <td>{s.phoneNumber}</td>
                    <td>{formatLocation(s)}</td>
                    <td>{formatDate(s.acceptedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AppLayout>
  )
}

export default Students
