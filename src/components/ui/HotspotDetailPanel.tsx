import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { TEMPLE_HOTSPOTS } from '../../data/templeData'
import { X, Image as ImageIcon, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react'
import { inputController } from '../input/InputController'

export const HotspotDetailPanel: React.FC = () => {
  const isFocusMode = useExperienceStore((s) => s.isFocusMode)
  const activeHotspotId = useExperienceStore((s) => s.activeHotspotId)
  const exitFocusMode = useExperienceStore((s) => s.exitFocusMode)
  const openPhotoModal = useExperienceStore((s) => s.openPhotoModal)
  const zoomFactor = useExperienceStore((s) => s.zoomFactor)

  if (!isFocusMode || !activeHotspotId) return null

  const hotspot = TEMPLE_HOTSPOTS.find((h) => h.id === activeHotspotId)
  if (!hotspot) return null

  const handleInspectPhoto = () => {
    openPhotoModal({
      title: hotspot.title,
      tamilTitle: hotspot.tamilTitle,
      imageSrc: hotspot.imageRef,
      caption: hotspot.shortDesc,
      details: hotspot.historicalContext,
      galleryImages: hotspot.galleryImages,
    })
  }

  return (
    <div
      role="region"
      aria-label="Architectural detail panel"
      className="fixed bottom-24 right-6 md:right-12 max-w-md w-[calc(100vw-3rem)] z-40 bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-slideUp text-left"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-400">
            {hotspot.category}
          </span>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-100">
            {hotspot.title}
          </h3>
          {hotspot.tamilTitle && (
            <span className="text-stone-400 text-xs font-serif italic">
              {hotspot.tamilTitle}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={exitFocusMode}
          className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          title="Exit focus mode (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Real Photography Preview Banner */}
      {hotspot.imageRef && (
        <div
          onClick={handleInspectPhoto}
          className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-amber-500/40 cursor-pointer group shadow-lg"
          title="Click to open full high-resolution photographic lightbox"
        >
          <img
            src={hotspot.imageRef}
            alt={hotspot.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 flex items-end justify-between p-2.5">
            <span className="text-[10px] font-mono text-amber-300 bg-black/75 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 shadow">
              <ImageIcon className="w-3 h-3 text-amber-400" />
              {hotspot.galleryImages ? `${hotspot.galleryImages.length} AUTHENTIC PHOTOS` : 'AUTHENTIC PHOTO'}
            </span>
            <span className="text-[10px] font-mono text-stone-300 bg-black/70 px-2 py-0.5 rounded group-hover:text-amber-300 transition-colors border border-stone-800">
              EXPAND LIGHTBOX ↗
            </span>
          </div>
        </div>
      )}

      {/* Special Inscription Callout Box for Epigraphy */}
      {hotspot.id === 'inscriptions' && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-left">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block mb-1">
            Chola Meikeerthi Granite Inscription (1010 CE):
          </span>
          <p className="font-serif text-amber-100 italic leading-relaxed text-[13px]">
            &quot;திருமகள் போலப் பெருநிலச் செல்வியுந் தநக்கேயுரிமை பூண்டமை மநக்கொள...&quot;
          </p>
          <span className="text-[10px] text-stone-400 mt-1 block font-mono">
            Decreed by Rajaraja I: Royal edicts chiseled across the plinth recording 400 temple dancers, gold endowments & architect Perunthachan.
          </span>
        </div>
      )}

      {/* Short Description */}
      <div className="mb-3">
        <h4 className="text-[11px] font-mono uppercase text-stone-500 tracking-wider mb-1">
          Description
        </h4>
        <p className="text-stone-200 text-sm leading-relaxed">
          {hotspot.shortDesc}
        </p>
      </div>

      {/* Historical Context */}
      <div className="mb-5">
        <h4 className="text-[11px] font-mono uppercase text-stone-500 tracking-wider mb-1">
          Historical Context
        </h4>
        <p className="text-stone-400 text-xs leading-relaxed font-serif max-h-28 overflow-y-auto pr-1 scrollbar-thin">
          {hotspot.historicalContext}
        </p>
      </div>

      {/* Actions: Photo Inspection & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80">
        <button
          type="button"
          onClick={handleInspectPhoto}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 hover:text-white font-mono text-xs tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.02]"
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>View Real Photography ({hotspot.galleryImages?.length || 1})</span>
        </button>

        <div className="flex items-center gap-1.5 bg-stone-900/90 rounded-lg p-1 border border-stone-800">
          <button
            type="button"
            onClick={() => inputController.addZoom(0.3, 'mouse')}
            className="p-1 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            title="Zoom In (or Pinch Up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-stone-500 px-1">
            {zoomFactor.toFixed(1)}x
          </span>
          <button
            type="button"
            onClick={() => inputController.addZoom(-0.3, 'mouse')}
            className="p-1 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            title="Zoom Out (or Pinch Down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
