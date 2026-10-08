import { useState, useEffect, useCallback } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import AppLayout from '../components/AppLayout'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8080'

const TEMPLATE_TYPES = [
  {
    value: 'ENROLLMENT',
    label: 'Enrollment Confirmation (sent when a student applies)',
    placeholders: ['{{parentName}}', '{{studentName}}', '{{admissionId}}'],
  },
  {
    value: 'ADMISSION_DECISION',
    label: 'Admission Confirmation (sent when admin accepts/rejects)',
    placeholders: ['{{parentName}}', '{{studentName}}', '{{admissionId}}', '{{status}}'],
  },
]

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

function EmailTemplates() {
  const [selectedType, setSelectedType] = useState(TEMPLATE_TYPES[0].value)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const activeTemplate = TEMPLATE_TYPES.find((t) => t.value === selectedType)

  const fetchTemplate = useCallback(async (type) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/email-templates/${type}`)
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      const data = await res.json()
      setSubject(data.subject || '')
      setBody(data.body || '')
    } catch (err) {
      setError(err.message || 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplate(selectedType)
  }, [selectedType, fetchTemplate])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/email-templates/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
      setSuccessMessage('Template saved successfully!')
    } catch (err) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Email Templates">
      <div className="template-selector">
        <label htmlFor="templateType">Select Email Template</label>
        <select
          id="templateType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {TEMPLATE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {activeTemplate && (
        <p className="template-placeholders">
          Available placeholders:{' '}
          {activeTemplate.placeholders.map((p) => (
            <code key={p}>{p}</code>
          ))}
        </p>
      )}

      {loading ? (
        <p className="empty-state">Loading template…</p>
      ) : (
        <div className="template-editor">
          <div className="template-field">
            <label htmlFor="templateSubject">Subject</label>
            <input
              id="templateSubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="template-field">
            <label>Body</label>
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={QUILL_MODULES}
            />
          </div>

          {error && <p className="enroll-submit-error">{error}</p>}
          {successMessage && <p className="template-success">{successMessage}</p>}

          <button className="nav-cta" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      )}
    </AppLayout>
  )
}

export default EmailTemplates
