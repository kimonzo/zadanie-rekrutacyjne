'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Url {
  id: number
  originalUrl: string
  shortCode: string
  shortUrl: string
  visibility: 'public' | 'private'
  createdAt: string
  expiresAt: string | null
  clickCount: number
  isExpired: boolean
}

export default function Home() {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [expiresIn, setExpiresIn] = useState('')
  const [urls, setUrls] = useState<Url[]>([])
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if session exists in localStorage
    const storedSessionToken = localStorage.getItem('sessionToken')
    const storedJwtToken = localStorage.getItem('jwtToken')

    if (storedSessionToken && storedJwtToken) {
      setSessionToken(storedSessionToken)
      setJwtToken(storedJwtToken)
    } else {
      createSession()
    }
  }, [])

  useEffect(() => {
    if (jwtToken) {
      loadUrls()
    }
  }, [jwtToken, filter])

  const createSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to create session')

      const data = await response.json()
      setSessionToken(data.sessionToken)
      setJwtToken(data.jwtToken)

      localStorage.setItem('sessionToken', data.sessionToken)
      localStorage.setItem('jwtToken', data.jwtToken)
    } catch (err) {
      setError('Failed to initialize session')
    }
  }

  const createShortUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          url,
          visibility,
          expiresIn: expiresIn || null
        })
      })

      if (!response.ok) throw new Error('Failed to create short URL')

      const data = await response.json()
      setSuccess(`Short URL created: ${data.shortUrl}`)
      setUrl('')
      setVisibility('public')
      setExpiresIn('')
      loadUrls()
    } catch (err) {
      setError('Failed to create short URL')
    } finally {
      setLoading(false)
    }
  }

  const loadUrls = async () => {
    try {
      const filterParam = filter !== 'all' ? `?visibility=${filter}` : ''
      const response = await fetch(`${API_URL}/api/urls${filterParam}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to load URLs')

      const data = await response.json()
      setUrls(data)
    } catch (err) {
      setError('Failed to load URLs')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>Create short, shareable links in seconds</p>
      </header>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Create Short URL</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={createShortUrl}>
          <div className="form-group">
            <label>Original URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="form-group">
            <label>Expires In (optional)</label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <option value="">Never</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
            </select>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Short URL'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Your URLs</h2>

        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${filter === 'public' ? 'active' : ''}`}
            onClick={() => setFilter('public')}
          >
            Public
          </button>
          <button
            className={`filter-button ${filter === 'private' ? 'active' : ''}`}
            onClick={() => setFilter('private')}
          >
            Private
          </button>
        </div>

        {urls.length === 0 ? (
          <div className="empty">No URLs found. Create your first short URL above!</div>
        ) : (
          <div className="url-list">
            {urls.map((urlItem) => (
              <div key={urlItem.id} className="url-item">
                <div className="url-header">
                  <div
                    className="url-short"
                    onClick={() => copyToClipboard(urlItem.shortUrl)}
                    style={{ cursor: 'pointer' }}
                    title="Click to copy"
                  >
                    {urlItem.shortUrl}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span className={`badge ${urlItem.visibility}`}>
                      {urlItem.visibility}
                    </span>
                    {urlItem.isExpired && (
                      <span className="badge expired">Expired</span>
                    )}
                  </div>
                </div>
                <div className="url-original">
                  <strong>Original:</strong> {urlItem.originalUrl}
                </div>
                <div className="url-meta">
                  <span>Clicks: {urlItem.clickCount}</span>
                  <span>Created: {new Date(urlItem.createdAt).toLocaleString()}</span>
                  {urlItem.expiresAt && (
                    <span>Expires: {new Date(urlItem.expiresAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
