const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function errorMessage(r: Response, fallback: string): Promise<string> {
  try {
    const e = await r.json()
    return e.detail || fallback
  } catch {
    return `${fallback} (HTTP ${r.status})`
  }
}

class APIClient {
  private token: string | null = null

  constructor() {
    const saved = localStorage.getItem('oncolens_token')
    if (saved) this.token = saved
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Accept': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  getToken(): string | null { return this.token }

  async login(email: string, password: string) {
    const r = await fetch(`${API_BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error(await errorMessage(r, 'Invalid credentials'))
    const data = await r.json()
    this.token = data.access_token ?? null
    if (this.token) localStorage.setItem('oncolens_token', this.token)
    return data
  }

  async register(email: string, password: string, fullName: string, role: string = 'doctor') {
    const r = await fetch(`${API_BASE}/v1/auth/register?full_name=${encodeURIComponent(fullName)}&role=${role}`, {
      method: 'POST',
      headers: { ...this.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error(await errorMessage(r, 'Registration failed'))
    const data = await r.json()
    this.token = data.access_token ?? null
    if (this.token) localStorage.setItem('oncolens_token', this.token)
    return data
  }

  async me() {
    const r = await fetch(`${API_BASE}/v1/auth/me`, { headers: this.headers() })
    if (!r.ok) return null
    return r.json()
  }

  async health() {
    const r = await fetch('/health')
    return r.json()
  }

  async predict(file: File, patientId?: number, onProgress?: (msg: any) => void) {
    // Create job
    const jobRes = await fetch(`${API_BASE}/predict/jobs`, {
      method: 'POST',
      headers: this.headers(),
    })
    const { job_id } = await jobRes.json()

    // Connect to progress WS
    if (onProgress) {
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProto}//${window.location.host}/api/v1/ws/progress/${job_id}`
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          onProgress(msg)
          if (msg.percent >= 100) ws.close()
        } catch {}
      }
      ws.onerror = () => {}
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('job_id', job_id)
    if (patientId) formData.append('patient_id', String(patientId))

    const r = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: this.headers(),
      body: formData,
    })
    if (!r.ok) throw new Error(await errorMessage(r, 'Prediction failed'))
    return r.json()
  }

  async history(limit = 50) {
    const r = await fetch(`${API_BASE}/history/scans?limit=${limit}`, { headers: this.headers() })
    if (!r.ok) throw new Error('Could not load scan history')
    return r.json()
  }

  async patients() {
    const r = await fetch(`${API_BASE}/patients`, { headers: this.headers() })
    if (!r.ok) throw new Error('Could not load patients')
    return r.json()
  }

  async downloadPdf(studyId: string, note = '') {
    const r = await fetch(`${API_BASE}/reports/${studyId}/pdf?clinician_note=${encodeURIComponent(note)}`, {
      headers: this.headers(),
    })
    if (!r.ok) throw new Error('Report unavailable')
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oncolens_${studyId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  logout() {
    this.token = null
    localStorage.removeItem('oncolens_token')
  }

  isAuthenticated() {
    return !!this.token
  }
}

export const api = new APIClient()
