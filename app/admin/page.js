'use client'

import { useState, useEffect, useCallback } from 'react'

const ADMIN_PASSWORD = 'kelanaadmin26'
const STORAGE_KEY = 'kr_admin_unlocked'

function printPhoto(url) {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><head><title>Print – Kelana Rasa</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @page { size: auto; margin: 0mm; }
      html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: #fff; }
      img { display: block; width: 100vw; height: 100vh; object-fit: fill; }
      @media print {
        html, body { margin: 0; padding: 0; }
        img { width: 100vw; height: 100vh; object-fit: fill; }
      }
    </style></head>
    <body>
      <img src="${url}" onload="window.print(); window.onafterprint = () => window.close();" />
    </body></html>
  `)
  win.document.close()
}

// ── Gate ──────────────────────────────────────────────────────────────────────
function AdminGate({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setError(false), 2000)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-cream px-6 gap-8">
      <div className="text-center">
        <div className="flex items-center gap-3 justify-center mb-3">
          <div className="w-10 h-px bg-rim-2" />
          <span className="text-ink-muted text-[10px] uppercase tracking-[0.35em] font-body">Admin Panel</span>
          <div className="w-10 h-px bg-rim-2" />
        </div>
        <h1 className="font-display font-black text-5xl md:text-6xl italic text-ink leading-tight">
          Kelana<br />Rasa
        </h1>
        <p className="text-ink-muted font-body text-sm mt-3">Masukkan kata sandi admin</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm flex flex-col gap-4 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="relative">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kata sandi admin..."
            autoFocus
            className={`w-full px-5 py-4 rounded-2xl border-2 font-body text-ink bg-white outline-none transition-all text-center tracking-widest text-lg
              ${error ? 'border-red-400 placeholder-red-300' : 'border-rim-2 focus:border-ink placeholder-ink-muted'}`}
          />
          {error && (
            <p className="text-red-400 font-body text-xs text-center mt-2">Kata sandi salah</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-white font-display font-black text-base italic transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#1a1a2e' }}
        >
          Masuk ✦
        </button>
      </form>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard({ onLock }) {
  const [photos, setPhotos]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [printing, setPrinting] = useState(null) // index currently being printed

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/photos')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal memuat foto')
      setPhotos(data.photos)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const handlePrint = (url, idx) => {
    setPrinting(idx)
    printPhoto(url)
    setTimeout(() => setPrinting(null), 2000)
  }

  const handlePrintLatest = () => {
    if (photos.length > 0) handlePrint(photos[0].url, -1)
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-rim-2" />
              <span className="text-ink-muted text-[10px] uppercase tracking-[0.35em] font-body">Admin Panel</span>
              <div className="w-8 h-px bg-rim-2" />
            </div>
            <h1 className="font-display font-black text-4xl italic text-ink">Kelana Rasa</h1>
            <p className="text-ink-muted font-body text-sm mt-1">
              {loading ? 'Memuat...' : `${photos.length} foto tersimpan`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Print latest – prominent on desktop */}
            {photos.length > 0 && (
              <button
                onClick={handlePrintLatest}
                disabled={printing === -1}
                className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-display font-black text-sm italic transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#1a1a2e', boxShadow: '0 4px 16px rgba(26,26,46,0.25)' }}
              >
                {printing === -1 ? '⏳ Printing...' : '🖨️ Print Foto Terbaru'}
              </button>
            )}

            <button
              onClick={fetchPhotos}
              className="px-4 py-3 rounded-2xl border-2 border-rim-2 text-ink-sub font-display font-bold text-sm italic hover:bg-cream-2 transition-colors"
            >
              🔄 Refresh
            </button>

            <button
              onClick={() => { sessionStorage.removeItem(STORAGE_KEY); onLock() }}
              className="px-4 py-3 rounded-2xl border-2 border-rim-2 text-ink-muted font-body text-sm hover:bg-cream-2 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Mobile print latest */}
        {photos.length > 0 && (
          <button
            onClick={handlePrintLatest}
            disabled={printing === -1}
            className="md:hidden mt-4 w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-display font-black text-base italic transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#1a1a2e', boxShadow: '0 4px 16px rgba(26,26,46,0.25)' }}
          >
            {printing === -1 ? '⏳ Printing...' : '🖨️ Print Foto Terbaru'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-10 h-10 border-2 border-rim-2 border-t-ink-sub rounded-full animate-spin" />
            <p className="text-ink-muted font-body text-sm">Memuat foto dari database...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="text-red-400 font-body text-sm text-center">{error}</p>
            <button
              onClick={fetchPhotos}
              className="px-5 py-3 rounded-2xl border-2 border-rim-2 text-ink-sub font-display font-bold text-sm italic hover:bg-cream-2 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24">
            <span className="text-5xl">📷</span>
            <p className="text-ink-muted font-body text-sm">Belum ada foto tersimpan</p>
          </div>
        )}

        {!loading && !error && photos.length > 0 && (
          <>
            {/* Latest photo highlighted */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-ink-muted text-[10px] uppercase tracking-[0.3em] font-body">✦ Foto Terbaru</span>
                <div className="flex-1 h-px bg-rim-2" />
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group w-full md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-rim">
                  <img
                    src={photos[0].url}
                    alt="Foto terbaru"
                    className="w-full object-cover"
                    style={{ aspectRatio: '1181/1772' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-ink font-display font-black text-xl italic">Foto Terbaru</p>
                    <p className="text-ink-muted font-body text-sm mt-1">{formatDate(photos[0].createdAt)}</p>
                    <p className="text-ink-muted/60 font-body text-xs mt-1">{photos[0].name}</p>
                  </div>
                  <button
                    onClick={() => handlePrint(photos[0].url, 0)}
                    disabled={printing === 0}
                    className="px-6 py-3.5 rounded-2xl text-white font-display font-black text-sm italic transition-all hover:opacity-90 disabled:opacity-60 w-fit"
                    style={{ background: '#1a1a2e', boxShadow: '0 4px 16px rgba(26,26,46,0.25)' }}
                  >
                    {printing === 0 ? '⏳ Printing...' : '🖨️ Print Foto Ini'}
                  </button>
                  <a
                    href={photos[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink-muted font-body text-sm hover:text-ink-sub transition-colors"
                  >
                    ↗ Buka di tab baru
                  </a>
                </div>
              </div>
            </div>

            {/* All photos grid */}
            {photos.length > 1 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-ink-muted text-[10px] uppercase tracking-[0.3em] font-body">✦ Semua Foto</span>
                  <div className="flex-1 h-px bg-rim-2" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.name}
                      className="flex flex-col gap-2 rounded-2xl overflow-hidden border border-rim bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full object-cover"
                          style={{ aspectRatio: '1181/1772' }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        <p className="text-ink-muted font-body text-[10px] leading-tight truncate">
                          {formatDate(photo.createdAt)}
                        </p>
                        <button
                          onClick={() => handlePrint(photo.url, idx + 1)}
                          disabled={printing === idx + 1}
                          className="w-full py-2 rounded-xl text-white font-display font-bold text-xs italic transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ background: '#1a1a2e' }}
                        >
                          {printing === idx + 1 ? '⏳' : '🖨️ Print'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(null)

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === '1')
    // Override body overflow so admin page can scroll
    document.body.style.overflow = 'auto'
    document.body.style.height   = 'auto'
    return () => {
      document.body.style.overflow = ''
      document.body.style.height   = ''
    }
  }, [])

  if (unlocked === null) return null

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />

  return <AdminDashboard onLock={() => setUnlocked(false)} />
}
