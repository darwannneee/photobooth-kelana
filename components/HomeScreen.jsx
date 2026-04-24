'use client'

import { useState } from 'react'
import { FRAMES } from '../lib/frames'

export default function HomeScreen({ onStart }) {
  const [selected, setSelected] = useState(FRAMES[0])

  return (
    <div className="flex h-full w-full overflow-hidden bg-cream">

      {/* ── LEFT: Brand Hero (fixed, tidak scroll) ── */}
      <div className="flex flex-col justify-between items-center px-8 py-10 w-[42%] md:w-[38%] border-r border-rim flex-shrink-0">

        {/* Top ornament */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-rim-2" />
            <span className="text-ink-muted text-[10px] tracking-[0.35em] font-body uppercase">est. 2025</span>
            <div className="w-10 h-px bg-rim-2" />
          </div>
          <div className="text-center">
            <p className="text-ink-muted text-[10px] uppercase tracking-[0.3em] font-body">❋ studio fotografi ❋</p>
            <h1 className="font-display font-black italic text-5xl md:text-6xl text-ink leading-none mt-1">
              Kelana
            </h1>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-ink-sub tracking-[0.15em] uppercase -mt-1">
              Rasa
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-px bg-rim-2" />
            <span className="text-ink-muted text-xs">✦</span>
            <div className="w-6 h-px bg-rim-2" />
          </div>
        </div>

        {/* Center hero */}
        <div className="text-center my-auto py-6">
          <p className="text-ink-sub text-[10px] uppercase tracking-[0.25em] font-body mb-3 flex items-center gap-2 justify-center">
            <span className="text-ink-muted">✦</span>
            create your perfect
            <span className="text-ink-muted">✦</span>
          </p>
          <div className="font-display leading-none">
            <span className="block text-2xl md:text-3xl font-bold text-ink-muted italic">photo</span>
            <span className="block text-6xl md:text-8xl font-black italic text-ink leading-none">Strip</span>
          </div>
          <div className="flex items-center gap-3 mt-4 justify-center">
            <div className="w-4 h-px bg-rim-2" />
            <p className="text-ink-muted text-xs font-body tracking-wider">
              pilih frame · berpose · simpan
            </p>
            <div className="w-4 h-px bg-rim-2" />
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-ink-muted/50 text-xs">✿</span>
            <span className="text-ink-muted text-[10px] tracking-[0.25em] font-body uppercase">capture · cherish · relive</span>
            <span className="text-ink-muted/50 text-xs">✿</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Frame picker (scrollable) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header section frame picker (sticky) */}
        <div className="flex-shrink-0 px-5 pt-6 pb-3 border-b border-rim bg-cream">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-rim" />
            <span className="text-ink-sub text-[10px] uppercase tracking-[0.25em] font-body flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-ink-muted">✦</span> pilih frame <span className="text-ink-muted">✦</span>
            </span>
            <div className="flex-1 h-px bg-rim" />
          </div>
          <p className="text-center text-ink-muted text-[10px] font-body mt-1.5">
            {FRAMES.length} frame tersedia · scroll untuk lihat semua
          </p>
        </div>

        {/* Scrollable frame grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {FRAMES.map((frame) => {
              const isSelected = selected.id === frame.id
              return (
                <div
                  key={frame.id}
                  onClick={() => !frame.comingSoon && setSelected(frame)}
                  style={
                    isSelected
                      ? { borderColor: frame.accent, boxShadow: `0 6px 24px ${frame.accent}44` }
                      : {}
                  }
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200
                    ${frame.comingSoon
                      ? 'border-rim opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'border-transparent scale-[1.01] cursor-pointer'
                        : 'border-rim hover:border-rim-2 hover:scale-[1.005] cursor-pointer'}`}
                >
                  <img
                    src={frame.src}
                    alt={frame.name}
                    className="w-full aspect-[2/3] object-cover"
                  />

                  {/* Coming Soon badge */}
                  {frame.comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <span className="bg-white/90 text-ink font-body text-[10px] uppercase tracking-widest px-2 py-1 rounded-full shadow">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Selected badge */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-md pointer-events-none"
                      style={{ color: frame.accent }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-3 pointer-events-none">
                    <span className="block text-white font-display italic text-sm font-bold leading-tight">{frame.name}</span>
                    <span className="block text-white/70 text-[10px] font-body">{frame.slots.length} foto</span>
                  </div>

                  {/* Accent dot */}
                  <div
                    className="absolute top-2 left-2 w-3 h-3 rounded-full ring-2 ring-white/80 shadow-sm pointer-events-none"
                    style={{ background: frame.accent }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="flex-shrink-0 bg-cream/95 backdrop-blur-sm border-t border-rim px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={selected.src}
              alt={selected.name}
              className="w-9 h-12 object-cover rounded-lg flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <strong className="block text-ink font-display italic text-sm truncate">{selected.name}</strong>
              <span className="text-ink-muted text-xs font-body">{selected.slots.length} foto</span>
            </div>
            <button
              onClick={() => onStart(selected)}
              style={{ background: selected.accent, boxShadow: `0 6px 20px ${selected.accent}55` }}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white font-display font-black text-sm italic tracking-wide transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            >
              <span className="text-white/70 text-[10px]">✦</span>
              Start
              <span className="text-white/70 text-[10px]">✦</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

