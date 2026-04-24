'use client'

import { useState } from 'react'

const PASSWORD = 'kelanarasa26'

export default function GateScreen({ onUnlock }) {
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
  const [shake, setShake]   = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === PASSWORD) {
      localStorage.setItem('kr_unlocked', '1')
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
      {/* Brand */}
      <div className="text-center">
        <div className="flex items-center gap-3 justify-center mb-3">
          <div className="w-10 h-px bg-rim-2" />
          <span className="text-ink-muted text-[10px] uppercase tracking-[0.35em] font-body">Selamat Datang</span>
          <div className="w-10 h-px bg-rim-2" />
        </div>
        <h1 className="font-display font-black text-5xl md:text-6xl italic text-ink leading-tight">
          Kelana<br />Rasa
        </h1>
        <p className="text-ink-muted font-body text-sm mt-3">Masukkan kata sandi untuk melanjutkan</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm flex flex-col gap-4 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="relative">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kata sandi..."
            autoFocus
            className={`w-full px-5 py-4 rounded-2xl border-2 font-body text-ink bg-white outline-none transition-all text-center tracking-widest text-lg
              ${error ? 'border-red-400 placeholder-red-300' : 'border-rim-2 focus:border-ink placeholder-ink-muted'}`}
          />
          {error && (
            <p className="text-red-400 font-body text-xs text-center mt-2">
              Kata sandi salah, coba lagi
            </p>
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
