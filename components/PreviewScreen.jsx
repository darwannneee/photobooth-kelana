'use client'

import { useState } from 'react'
import { uploadSession } from '../lib/supabase'

const FRAME_W = 1181
const FRAME_H = 1772

async function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

async function buildCompositeBlob(frame, photos) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  const ctx = canvas.getContext('2d')

  // Layer 1: background (frame.bg) or fallback to frame.src
  const bgSrc = frame.bg || frame.src
  const bgImg = await loadImage(bgSrc)
  ctx.drawImage(bgImg, 0, 0, FRAME_W, FRAME_H)

  // Layer 2: photos placed in slots
  const slots = frame.slots
  for (let i = 0; i < slots.length; i++) {
    if (!photos[i]) continue
    const slot = slots[i]
    const img = await loadImage(photos[i])
    const sx = slot.x * FRAME_W, sy = slot.y * FRAME_H
    const sw = slot.w * FRAME_W, sh = slot.h * FRAME_H
    const pAR = img.width / img.height, sAR = sw / sh
    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height
    if (pAR > sAR) { srcW = img.height * sAR; srcX = (img.width - srcW) / 2 }
    else            { srcH = img.width / sAR;  srcY = (img.height - srcH) / 2 }
    ctx.drawImage(img, srcX, srcY, srcW, srcH, sx, sy, sw, sh)
  }

  // Layer 3: overlay (icon/decoration on top), if defined
  if (frame.overlay) {
    const overlayImg = await loadImage(frame.overlay)
    ctx.drawImage(overlayImg, 0, 0, FRAME_W, FRAME_H)
  }

  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95))
}

function dataURLtoBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function buildGIF(photos) {
  const { default: gifshot } = await import('gifshot')

  // Detect actual photo dimensions to preserve aspect ratio
  // (mobile/iPad cameras may produce portrait or non-16:9 frames)
  const firstImg = await loadImage(photos[0])
  const photoW = firstImg.naturalWidth
  const photoH = firstImg.naturalHeight
  const MAX = 480
  const gifWidth  = photoW >= photoH ? MAX : Math.round(MAX * photoW / photoH)
  const gifHeight = photoW >= photoH ? Math.round(MAX * photoH / photoW) : MAX

  return new Promise((resolve, reject) => {
    gifshot.createGIF({
      images: photos,
      gifWidth,
      gifHeight,
      interval: 0.7,
      numWorkers: 2,
      sampleInterval: 5,
    }, (obj) => {
      if (obj.error) reject(new Error(obj.error === true ? `GIF error ${obj.errorCode}` : obj.error))
      else resolve(obj.image) // data URL
    })
  })
}

async function makeQR(url) {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(url, { width: 220, margin: 2, color: { dark: '#1e1510', light: '#fdf9f5' } })
}

export default function PreviewScreen({ frame, photos, onRetake, onRetakeAll, onHome }) {
  const [shareState, setShareState] = useState('idle') // idle | processing | done
  const [shareData,  setShareData]  = useState(null)   // { jpegUrl, gifUrl, jpegQR, gifQR }
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const slots = frame.slots

  // Print composite photo
  const handlePrint = async () => {
    setSaving(true)
    try {
      const blob = await buildCompositeBlob(frame, photos)
      const url = URL.createObjectURL(blob)
      const win = window.open('', '_blank')
      win.document.write(`
        <html><head><title>Kelana Rasa</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: auto; margin: 0mm; }
          html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background: #fff; }
          img { display: block; width: 100vw; height: 100vh; object-fit: fill; }
          @media print {
            html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; }
            img { width: 100vw; height: 100vh; object-fit: fill; }
          }
        </style></head>
        <body><img src="${url}" onload="window.print(); window.onafterprint = () => { window.close(); URL.revokeObjectURL('${url}'); }" /></body>
        </html>
      `)
      win.document.close()
      setSaved(true)
    } catch (e) {
      console.error(e)
      alert('Gagal print foto.')
    } finally {
      setSaving(false)
    }
  }

  // Upload to Supabase → QR
  const handleShare = async () => {
    setShareState('processing')
    try {
      const [jpegBlob, gifDataUrl] = await Promise.all([
        buildCompositeBlob(frame, photos),
        buildGIF(photos),
      ])

      // Convert GIF data URL to Blob (avoid fetch() — fails on Safari with invalid data URLs)
      if (!gifDataUrl || !gifDataUrl.startsWith('data:')) {
        throw new Error('Gagal membuat GIF: data URL tidak valid')
      }
      const gifBlob = dataURLtoBlob(gifDataUrl)

      const { jpegUrl, gifUrl } = await uploadSession(jpegBlob, gifBlob)

      const [jpegQR, gifQR] = await Promise.all([makeQR(jpegUrl), makeQR(gifUrl)])

      setShareData({ jpegUrl, gifUrl, jpegQR, gifQR })
      setShareState('done')
    } catch (e) {
      console.error(e)
      alert(`Gagal upload: ${e.message}`)
      setShareState('idle')
    }
  }

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto bg-cream px-4 py-8 gap-6">

      {/* Header */}
      <div className="text-center flex-shrink-0">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-8 h-px bg-rim-2" />
          <span className="text-ink-muted text-[10px] uppercase tracking-[0.3em] font-body">❋ Kelana Rasa ❋</span>
          <div className="w-8 h-px bg-rim-2" />
        </div>
        <h2 className="font-display font-black text-4xl md:text-5xl italic text-ink">Hasilnya!</h2>
        <p className="text-ink-muted font-body text-sm mt-1">simpan dan bagikan kenangan indahmu</p>
      </div>

      {/* Photo strip */}
      <div className="flex flex-col items-center gap-3 flex-shrink-0 w-full max-w-[300px] md:max-w-[380px]">
        <span className="text-ink-muted font-body text-[10px] tracking-widest">✦ {frame.name} ✦</span>
        {/* Retake hint */}
        <p className="text-ink-muted font-body text-[10px] text-center tracking-wide leading-relaxed">
          👆 Ingin retake? Klik langsung pada foto ke-1, ke-2, dst<br/>di dalam frame untuk mengulang foto tersebut saja
        </p>
        <div
          className="relative w-full overflow-hidden shadow-xl"
          style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
        >
          {/* Layer 1: background */}
          <img src={frame.bg || frame.src} alt="frame bg" className="absolute inset-0 w-full h-full object-cover" />
          {/* Layer 2: photos — with per-photo retake button */}
          {photos.map((src, i) => {
            const slot = slots[i]
            if (!slot) return null
            return (
              <div
                key={i}
                className="absolute group"
                style={{
                  left:   `${slot.x * 100}%`,
                  top:    `${slot.y * 100}%`,
                  width:  `${slot.w * 100}%`,
                  height: `${slot.h * 100}%`,
                }}
              >
                <img
                  src={src}
                  alt={`foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Retake overlay on hover/tap */}
                <button
                  onClick={() => onRetake(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-white text-base">🔄</span>
                  <span className="text-white text-[9px] font-body font-bold tracking-wider">Foto ke-{i + 1}</span>
                  <span className="text-white/80 text-[8px] font-body">tap untuk retake</span>
                </button>
              </div>
            )
          })}
          {/* Layer 3: overlay icon (if defined) */}
          {frame.overlay && (
            <img src={frame.overlay} alt="frame overlay" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          )}
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex gap-3 w-full max-w-[300px] md:max-w-[380px] flex-shrink-0">
        <button
          onClick={onRetakeAll}
          className="flex-1 py-3.5 rounded-2xl border-2 border-rim text-ink-sub font-display font-bold text-sm italic hover:bg-cream-2 transition-colors"
        >
          🔄 Ulangi Semua
        </button>
        <button
          onClick={handlePrint}
          disabled={saving}
          style={{ background: frame.accent, boxShadow: `0 6px 20px ${frame.accent}44` }}
          className="flex-1 py-3.5 rounded-2xl text-white font-display font-black text-sm italic transition-all hover:opacity-90 disabled:opacity-60"
        >
          {saving ? '⏳...' : saved ? '✅ Terprint' : '🖨️ Print'}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-[300px] md:max-w-[380px] flex-shrink-0">
        <div className="flex-1 h-px bg-rim" />
        <span className="text-ink-muted text-[10px] uppercase tracking-[0.2em] font-body">atau bagikan</span>
        <div className="flex-1 h-px bg-rim" />
      </div>

      {/* Share / QR section */}
      {shareState === 'idle' && (
        <button
          onClick={handleShare}
          className="w-full max-w-[300px] md:max-w-[380px] py-4 rounded-2xl border-2 border-rim-2 text-ink-sub font-display font-bold text-sm italic hover:bg-cream-2 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span>⬇️</span> Download &amp; Dapatkan QR Code
        </button>
      )}

      {shareState === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-6 flex-shrink-0">
          <div className="w-10 h-10 border-2 border-rim-2 border-t-ink-sub rounded-full animate-spin" />
          <p className="text-ink-muted font-body text-sm text-center">
            Membuat GIF &amp; mengupload foto...<br />
            <span className="text-[11px] text-ink-muted/70">Ini mungkin butuh beberapa detik</span>
          </p>
        </div>
      )}

      {shareState === 'done' && shareData && (
        <div className="flex flex-col items-center gap-5 w-full max-w-[300px] md:max-w-[380px] flex-shrink-0">

          {/* QR Cards */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* JPEG QR */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-cream-2 border border-rim">
              <p className="text-ink-muted text-[10px] uppercase tracking-widest font-body">📷 Foto</p>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <img src={shareData.jpegQR} alt="QR JPEG" className="w-24 h-24" />
              </div>
              <p className="text-ink-muted text-[9px] font-body text-center leading-tight">
                Scan untuk<br />download foto
              </p>
            </div>

            {/* GIF QR */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-cream-2 border border-rim">
              <p className="text-ink-muted text-[10px] uppercase tracking-widest font-body">✨ GIF</p>
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <img src={shareData.gifQR} alt="QR GIF" className="w-24 h-24" />
              </div>
              <p className="text-ink-muted text-[9px] font-body text-center leading-tight">
                Scan untuk<br />download GIF
              </p>
            </div>
          </div>

          {/* Direct download links */}
          <div className="flex gap-3 w-full">
            <a
              href={shareData.jpegUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 rounded-xl border border-rim text-ink-sub font-body text-xs text-center hover:bg-cream transition-colors"
            >
              ↓ Download Foto
            </a>
            <a
              href={shareData.gifUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 rounded-xl border border-rim text-ink-sub font-body text-xs text-center hover:bg-cream transition-colors"
            >
              ↓ Download GIF
            </a>
          </div>

          <p className="text-ink-muted/60 font-body text-[10px] tracking-widest text-center">
            ❋ Kelana Rasa · kenangan tersimpan ❋
          </p>
        </div>
      )}

      {/* Home link */}
      <button
        onClick={onHome}
        className="text-ink-muted font-body text-sm hover:text-ink-sub transition-colors flex-shrink-0"
      >
        ← Pilih Frame Lain
      </button>
    </div>
  )
}

