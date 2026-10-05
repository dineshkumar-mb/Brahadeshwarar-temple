import React, { useState, useEffect, useCallback } from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { getGalleryPhotoMeta } from '../../data/templeData'
import { X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Layers, Camera } from 'lucide-react'

export const PhotoModal: React.FC = () => {
  const activeModal = useExperienceStore((s) => s.activePhotoModal)
  const closeModal = useExperienceStore((s) => s.closePhotoModal)

  const [activeImage, setActiveImage] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  useEffect(() => {
    if (activeModal) {
      setActiveImage(activeModal.imageSrc)
    }
  }, [activeModal?.imageSrc])

  const gallery = activeModal?.galleryImages || (activeModal ? [activeModal.imageSrc] : [])
  const currentIndex = Math.max(0, gallery.indexOf(activeImage || activeModal?.imageSrc || ''))

  const handlePrev = useCallback(() => {
    if (gallery.length <= 1) return
    useExperienceStore.getState().navigatePhotoModal(-1)
  }, [gallery.length])

  const handleNext = useCallback(() => {
    if (gallery.length <= 1) return
    useExperienceStore.getState().navigatePhotoModal(1)
  }, [gallery.length])

  // Keyboard navigation
  useEffect(() => {
    if (!activeModal) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key.toLowerCase() === 'f') {
        setIsExpanded((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal, closeModal, handlePrev, handleNext])

  if (!activeModal) return null

  // Retrieve authentic metadata for the currently active photo
  const currentPhotoMeta = getGalleryPhotoMeta(activeImage || activeModal.imageSrc, activeModal)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentPhotoMeta.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={closeModal}
    >
      <div
        className={`relative w-full max-h-[92vh] bg-stone-950 border border-amber-600/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'max-w-6xl md:flex-col' : 'max-w-5xl md:flex-row'
        }`}
        style={{ width: '95vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Lightbox Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer border border-stone-700 shadow-lg"
            title={isExpanded ? 'Standard Split View (F)' : 'Expand Fullscreen Lightbox (F)'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeModal}
            className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700 shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Resolution Real Photograph Section */}
        <div
          className="bg-black flex flex-col justify-between relative overflow-hidden group"
          style={{ flex: isExpanded ? '1 1 75%' : '1 1 58%', minHeight: '340px' }}
        >
          <div className="flex-1 flex items-center justify-center relative p-3 min-h-[300px] overflow-hidden">
            <img
              src={activeImage || activeModal.imageSrc}
              alt={currentPhotoMeta.title}
              className="w-full h-full max-h-[55vh] md:max-h-[72vh] object-contain transition-transform duration-500 group-hover:scale-[1.015]"
            />

            {/* Navigation Arrows for Multi-image Galleries */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 hover:bg-black/90 text-stone-200 hover:text-amber-300 transition-all cursor-pointer border border-stone-800 shadow-lg hover:scale-105"
                  title="Previous photo (←)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/65 hover:bg-black/90 text-stone-200 hover:text-amber-300 transition-all cursor-pointer border border-stone-800 shadow-lg hover:scale-105"
                  title="Next photo (→)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter & Verification Badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-black/80 text-[10px] font-mono text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-400" />
                PHOTO {currentIndex + 1} OF {gallery.length}
              </span>
              <span className="hidden sm:inline-block px-2 py-1 rounded bg-black/75 text-[10px] font-mono text-stone-300 border border-stone-800/80">
                1000-YR CHOLA HERITAGE
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails Strip */}
          {gallery.length > 1 && (
            <div className="p-3 bg-stone-950/95 border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <span className="text-[10px] font-mono text-stone-400 uppercase mr-1 flex items-center gap-1 flex-shrink-0">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Archive:
              </span>
              {gallery.map((img, idx) => {
                const thumbMeta = getGalleryPhotoMeta(img)
                return (
                  <button
                    key={`thumb-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(img)
                      useExperienceStore.setState((s) => ({
                        activePhotoModal: s.activePhotoModal ? { ...s.activePhotoModal, imageSrc: img } : null,
                      }))
                    }}
                    className={`w-14 h-11 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 relative group/thumb ${
                      activeImage === img
                        ? 'border-amber-400 scale-105 shadow-[0_0_10px_rgba(251,191,36,0.6)] ring-1 ring-amber-400'
                        : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-600'
                    }`}
                    title={thumbMeta.title}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Editorial Information Column */}
        <div
          className={`p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#14100c] to-[#0a0807] ${
            isExpanded ? 'border-t border-stone-800' : ''
          }`}
          style={{ flex: isExpanded ? '1 1 auto' : '1 1 42%', maxHeight: isExpanded ? '35vh' : '90vh' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">
                {currentPhotoMeta.category || 'Architectural Detail'}
              </span>
            </div>

            <h3 className="mt-1 text-2xl font-serif font-bold text-amber-100">
              {currentPhotoMeta.title}
            </h3>

            {currentPhotoMeta.tamilTitle && (
              <span className="text-stone-400 text-sm font-serif italic block mt-0.5">
                {currentPhotoMeta.tamilTitle}
              </span>
            )}

            <p className="mt-4 text-stone-200 text-sm leading-relaxed border-l-2 border-amber-500/50 pl-3">
              {currentPhotoMeta.caption}
            </p>

            <div className="mt-5">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                Curatorial & Archaeological Insight
              </h4>
              <p className="text-stone-300 text-xs leading-relaxed font-serif">
                {currentPhotoMeta.details}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>THANJAVUR CHOLA DYNASTY (1010 CE)</span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-stone-500">Keys: ← → / Esc</span>
              <button
                type="button"
                onClick={closeModal}
                className="text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
              >
                Return to 3D View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoModal
