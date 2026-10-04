import React, { useState, useEffect } from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { X, ExternalLink, Maximize2, ChevronLeft, ChevronRight, Layers } from 'lucide-react'

export const PhotoModal: React.FC = () => {
  const activeModal = useExperienceStore((s) => s.activePhotoModal)
  const closeModal = useExperienceStore((s) => s.closePhotoModal)

  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    if (activeModal) {
      setActiveImage(activeModal.imageSrc)
    }
  }, [activeModal])

  if (!activeModal) return null

  const gallery = activeModal.galleryImages || [activeModal.imageSrc]
  const currentIndex = gallery.indexOf(activeImage)

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + gallery.length) % gallery.length
    setActiveImage(gallery[nextIdx])
  }

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % gallery.length
    setActiveImage(gallery[nextIdx])
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeModal.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={closeModal}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-stone-950 border border-amber-600/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{ maxWidth: '960px', width: '94vw', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700 shadow-lg"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-Resolution Real Photograph Section */}
        <div
          className="bg-black flex flex-col justify-between relative overflow-hidden group"
          style={{ flex: '1 1 58%', minHeight: '320px' }}
        >
          <div className="flex-1 flex items-center justify-center relative p-3 min-h-[300px]">
            <img
              src={activeImage || activeModal.imageSrc}
              alt={activeModal.title}
              className="w-full h-full max-h-[55vh] md:max-h-[75vh] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Navigation Arrows for Multi-image Galleries */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer border border-stone-800 shadow-md"
                  title="Previous view"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer border border-stone-800 shadow-md"
                  title="Next view"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/75 text-[10px] font-mono text-amber-300 border border-stone-800/80">
              AUTHENTIC ARCHAEOLOGICAL PHOTOGRAPHY
            </div>
          </div>

          {/* Gallery Thumbnails Strip */}
          {gallery.length > 1 && (
            <div className="p-3 bg-stone-950/90 border-t border-stone-900 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-mono text-stone-500 uppercase mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                Views:
              </span>
              {gallery.map((img, idx) => (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-11 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 ${
                    activeImage === img
                      ? 'border-amber-400 scale-105 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'border-stone-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editorial Information Column */}
        <div
          className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#14100c] to-[#0a0807]"
          style={{ flex: '1 1 42%', maxHeight: '88vh' }}
        >
          <div>
            <span className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">
              Architectural Detail
            </span>
            <h3 className="mt-1 text-2xl font-serif font-bold text-amber-100">
              {activeModal.title}
            </h3>
            {activeModal.tamilTitle && (
              <span className="text-stone-400 text-sm font-serif italic block mt-0.5">
                {activeModal.tamilTitle}
              </span>
            )}

            <p className="mt-4 text-stone-200 text-sm leading-relaxed border-l-2 border-amber-500/50 pl-3">
              {activeModal.caption}
            </p>

            <div className="mt-6">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-2">
                Curatorial Insight
              </h4>
              <p className="text-stone-300 text-xs leading-relaxed font-serif">
                {activeModal.details}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>THANJAVUR CHOLA DYNASTY</span>
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
  )
}

export default PhotoModal
