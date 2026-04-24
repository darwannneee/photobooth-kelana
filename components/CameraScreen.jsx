'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const COUNTDOWN_SEC = 3
const PAUSE_AFTER_MS = 900

export default function CameraScreen({ frame, retakeIndex, onDone, onBack }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef  = useRef(null)
  const isMounted = useRef(true)

  const TOTAL = retakeIndex !== null ? 1 : frame.slots.length

  const [phase, setPhase]         = useState('init')
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)
  const [photos, setPhotos]       = useState([])
  const photosRef                 = useRef([])
  const [flash, setFlash]         = useState(false)
  const [camError, setCamError]   = useState(null)

  useEffect(() => {
    isMounted.current = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        if (isMounted.current) setPhase('ready')
      })
      .catch((err) => { if (isMounted.current) setCamError(err.message) })

    return () => {
      isMounted.current = false
      clearTimeout(timerRef.current)
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  const doCapture = useCallback(() => {
    if (!isMounted.current) return
    setFlash(true)
    setTimeout(() => setFlash(false), 350)

    const dataUrl = capturePhoto()
    if (!dataUrl) return

    const next = [...photosRef.current, dataUrl]
    photosRef.current = next
    setPhotos([...next])

    if (next.length < TOTAL) {
      setPhase('between')
      timerRef.current = setTimeout(() => beginShot(), PAUSE_AFTER_MS)
    } else {
      setPhase('done')
      setTimeout(() => { if (isMounted.current) onDone(next) }, 700)
    }
  }, [TOTAL, capturePhoto, onDone])

  const beginShot = useCallback(() => {
    if (!isMounted.current) return
    let c = COUNTDOWN_SEC
    setCountdown(c)
    setPhase('countdown')
    timerRef.current = setInterval(() => {
      c -= 1
      if (isMounted.current) setCountdown(c)
      if (c <= 0) { clearInterval(timerRef.current); doCapture() }
    }, 1000)
  }, [doCapture])

  const handleStart = () => {
    photosRef.current = []
    setPhotos([])
    beginShot()
  }

  const handleBack = () => {
    clearInterval(timerRef.current)
    clearTimeout(timerRef.current)
    onBack()
  }

  const isActive = phase === 'countdown' || phase === 'between'

  // Detect landscape slot (Frame 9)
  const firstSlot = frame.slots[0]
  const isLandscape = firstSlot.w > firstSlot.h
  const slotRatio = `${firstSlot.w} / ${firstSlot.h}`

  if (camError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-cream text-ink">
        <div className="text-5xl">📷</div>
        <p className="font-display font-bold text-xl">Kamera tidak bisa diakses</p>
        <small className="text-ink-muted font-body text-sm">{camError}</small>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-3 rounded-full border border-rim text-ink-sub font-body text-sm hover:bg-cream-2 transition-colors"
        >
          ← Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black">

      {/* ── Video area ── */}
      <div className={`relative flex-1 min-h-0 overflow-hidden ${isLandscape ? 'bg-black flex items-center justify-center' : ''}`}>
        {/* Inner container: aspect-ratio box for landscape, full fill for portrait */}
        <div
          className={`relative overflow-hidden ${isLandscape ? 'w-full mx-6 rounded-2xl' : 'w-full h-full'}`}
          style={isLandscape ? { aspectRatio: slotRatio } : {}}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover mirror"
            playsInline
            muted
            autoPlay
          />

          {/* Flash */}
          {flash && (
            <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-20" />
          )}

          {/* Top bar */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-sm flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              ✕
            </button>
            <div className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs font-body font-medium">
              {photosRef.current.length} / {TOTAL}
            </div>
          </div>

          {/* Story progress bars (only for multi-shot frames) */}
          {TOTAL > 1 && (
            <div className="absolute top-14 left-3 right-3 flex gap-1.5 z-10">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                  <div
                    className={[
                      'h-full bg-white rounded-full',
                      i < photos.length ? 'w-full' : '',
                      i === photos.length && phase === 'countdown' ? 'animate-seg-fill' : '',
                      i > photos.length || (i === photos.length && phase !== 'countdown') ? 'w-0' : '',
                    ].join(' ')}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Countdown overlay */}
          {phase === 'countdown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-24 h-24 rounded-full backdrop-blur-sm bg-white/10 border border-white/50 flex items-center justify-center animate-ring-pulse">
                <span className="font-display text-5xl font-black text-white">{countdown}</span>
              </div>
              <p className="mt-4 text-white/80 font-body text-sm tracking-widest uppercase">berpose!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Camera panel ── */}
      <div className="bg-cream border-t border-rim flex-shrink-0 flex flex-col gap-4 p-5 overflow-y-auto">

        {/* Status */}
        <p className="text-ink-sub font-body text-sm text-center">
          {phase === 'ready'     && <span>Siap berfoto? <em className="text-ink-muted">Tekan tombol di bawah ✦</em></span>}
          {phase === 'countdown' && <span>Foto <strong className="text-ink">{photos.length + 1}</strong> dari <strong className="text-ink">{TOTAL}</strong> &nbsp;·&nbsp; Senyum! 😄</span>}
          {phase === 'between'   && <span>Foto <strong className="text-ink">{photos.length}</strong> dari <strong className="text-ink">{TOTAL}</strong> &nbsp;·&nbsp; Bersiap...</span>}
          {phase === 'done'      && <span className="text-ink">Sempurna! ✨ Menyiapkan hasilmu...</span>}
        </p>

        {/* Thumbnails */}
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              style={photos[i] ? { borderColor: frame.accent } : {}}
              className={`overflow-hidden rounded-lg border-2 flex items-center justify-center flex-shrink-0
                ${isLandscape ? 'w-24 h-16' : 'w-14 h-20'}
                ${photos[i] ? 'border-transparent' : 'border-rim bg-cream-2 text-ink-muted font-body text-xs'}`}
            >
              {photos[i]
                ? <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                : <span>{i + 1}</span>
              }
            </div>
          ))}
        </div>

        {/* Start button */}
        {phase === 'ready' && (
          <button
            onClick={handleStart}
            style={{ background: frame.accent, boxShadow: `0 8px 24px ${frame.accent}44` }}
            className="w-full py-4 rounded-2xl text-white font-display font-black text-base italic tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.99] mt-auto"
          >
            📷 &nbsp;Mulai Sesi Foto
          </button>
        )}

        {/* Progress segments while shooting */}
        {isActive && (
          <div className="flex gap-1.5 mt-auto">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                style={i < photos.length ? { background: frame.accent } : {}}
                className={`flex-1 h-1.5 rounded-full ${i < photos.length ? '' : 'bg-rim'}`}
              />
            ))}
          </div>
        )}

        {/* Brand footer */}
        <p className="text-ink-muted/50 text-[10px] tracking-widest font-body text-center mt-auto pt-2">
          ❋ Kelana Rasa ❋
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
