import { useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/AppLayout'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

function SchoolInfo() {
  const [form, setForm] = useState({
    seatsAvailable: '',
    openingDate: '',
    venue: '',
    schedule: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const fetchInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/school-info`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setForm({
        seatsAvailable: data.seatsAvailable ?? '',
        openingDate: data.openingDate ?? '',
        venue: data.venue ?? '',
        schedule: data.schedule ?? '',
      })
    } catch (err) {
      setError(err.message || 'Failed to load school info')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInfo()
  }, [fetchInfo])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(`${API_BASE_URL}/api/school-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatsAvailable: Number(form.seatsAvailable),
          openingDate: form.openingDate,
          venue: form.venue,
          schedule: form.schedule,
        }),
      })
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to save school info')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="School Info">
      {loading && <p className="empty-state">Loading…</p>}

      {!loading && (
        <form className="school-info-form" onSubmit={handleSubmit}>
          <div className="school-info-field">
            <label htmlFor="seatsAvailable">Seats Available</label>
            <input
              id="seatsAvailable"
              type="number"
              min="0"
              value={form.seatsAvailable}
              onChange={(e) => handleChange('seatsAvailable', e.target.value)}
              required
            />
          </div>

          <div className="school-info-field">
            <label htmlFor="openingDate">Opening Date</label>
            <input
              id="openingDate"
              type="text"
              placeholder="e.g. 17 October"
              value={form.openingDate}
              onChange={(e) => handleChange('openingDate', e.target.value)}
              required
            />
          </div>

          <div className="school-info-field">
            <label htmlFor="venue">Venue</label>
            <input
              id="venue"
              type="text"
              placeholder="e.g. My Home Bhooja, Zumba Room, 3rd Floor, Club House"
              value={form.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              required
            />
          </div>

          <div className="school-info-field">
            <label htmlFor="schedule">Schedule</label>
            <input
              id="schedule"
              type="text"
              placeholder="e.g. Weekend Development Classes"
              value={form.schedule}
              onChange={(e) => handleChange('schedule', e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-info">Saved successfully! Changes are now live on the public site.</p>}

          <button type="submit" className="login-btn school-info-save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </AppLayout>
  )
}

export default SchoolInfo
