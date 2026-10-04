import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { TIMELINE_EVENTS } from '../../data/templeData'
import { X, Clock, Calendar, ShieldCheck, Camera, Image as ImageIcon } from 'lucide-react'

export const TempleTimelineModal: React.FC = () => {
  const isOpen = useExperienceStore((s) => s.isTimelineOpen)
  const toggleTimeline = () =>
    useExperienceStore.setState((s) => ({ isTimelineOpen: !s.isTimelineOpen }))
  const openPhotoModal = useExperienceStore((s) => s.openPhotoModal)

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Historical timeline modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={toggleTimeline}
    >
      <div
        className="relative max-w-3xl w-full max-h-[85vh] bg-stone-950 border border-amber-600/40 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: '820px', width: '92vw', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-100">
                Millennium of Brihadisvara
              </h3>
              <p className="text-stone-400 text-xs font-mono">
                1010 CE TO PRESENT DAY • UNBROKEN SACRED HERITAGE
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTimeline}
            className="p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Timeline Stream */}
        <div className="overflow-y-auto space-y-6 pr-2">
          {TIMELINE_EVENTS.map((event, idx) => (
            <div
              key={`timeline-ev-${idx}`}
              className="relative pl-6 border-l-2 border-amber-500/40 pb-4 last:border-l-transparent"
            >
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-4 border-stone-950 shadow-[0_0_8px_#f59e0b]" />

              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {event.year}
                </span>
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                  {event.period}
                </span>
              </div>

              <h4 className="text-lg font-serif font-bold text-stone-100">
                {event.title}
              </h4>
              {event.tamilTitle && (
                <span className="text-stone-400 text-xs font-serif italic block mb-1">
                  {event.tamilTitle}
                </span>
              )}

              <p className="text-stone-300 text-xs leading-relaxed mt-2">
                {event.description}
              </p>

              <div className="mt-2 text-[11px] font-mono text-amber-300/80 bg-stone-900/60 p-2 rounded border border-stone-800">
                <strong>Significance:</strong> {event.significance}
              </div>

              {event.imageRef && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      openPhotoModal({
                        title: event.title,
                        tamilTitle: event.tamilTitle,
                        imageSrc: event.imageRef!,
                        caption: event.period,
                        details: event.description,
                        galleryImages: [
                          event.imageRef!,
                          '/images/lingam.jpg',
                          '/images/temple/entrance.jpg',
                          '/images/temple/nandhi-sideview.jpg',
                        ],
                      })
                    }}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg bg-stone-900/80 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-stone-700 bg-stone-950">
                      <img
                        src={event.imageRef}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        AUTHENTIC PHOTOGRAPHY
                      </span>
                      <span className="text-xs text-stone-200 font-serif line-clamp-1">
                        View {event.imageRef.includes('lingam') ? 'Peruvudaiyar Maha Lingam' : 'Archaeological Archive'}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center text-[11px] font-mono text-stone-500">
          <span>SOURCE: ARCHAEOLOGICAL SURVEY OF INDIA & EPIGRAPHIA INDICA</span>
          <button
            type="button"
            onClick={toggleTimeline}
            className="text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  )
}
