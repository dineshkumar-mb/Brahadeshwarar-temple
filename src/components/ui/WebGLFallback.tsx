import React from 'react'
import { TEMPLE_HOTSPOTS, TIMELINE_EVENTS } from '../../data/templeData'
import { Landmark, AlertCircle, Eye } from 'lucide-react'
import { useExperienceStore } from '../../state/experienceStore'

export const WebGLFallback: React.FC = () => {
  const openPhotoModal = useExperienceStore((s) => s.openPhotoModal)

  return (
    <main className="min-h-screen bg-[#070605] text-stone-200 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Notice */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-3 text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            WebGL 3D hardware acceleration is unavailable on your browser. Enjoy our rich
            interactive archaeological gallery and historical timeline below.
          </span>
        </div>

        {/* Hero */}
        <div className="text-center space-y-4">
          <span className="text-amber-500 font-mono text-xs uppercase tracking-[0.3em]">
            UNESCO World Heritage • 1010 CE
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-amber-100 tracking-wide">
            Brihadisvara Temple
          </h1>
          <p className="text-stone-400 text-lg font-serif italic max-w-2xl mx-auto">
            Thanjavur Peruvudaiyar Kovil — The Monumental Granite Masterpiece of Emperor Rajaraja Chola I
          </p>
        </div>

        {/* Featured Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLE_HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all group"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src={spot.imageRef}
                  alt={spot.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() =>
                    openPhotoModal({
                      title: spot.title,
                      tamilTitle: spot.tamilTitle,
                      imageSrc: spot.imageRef,
                      caption: spot.shortDesc,
                      details: spot.historicalContext,
                    })
                  }
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/70 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  title="Inspect photograph"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <span className="text-[10px] font-mono uppercase text-amber-400">
                  {spot.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-amber-100 mt-1">
                  {spot.title}
                </h3>
                <p className="text-stone-300 text-xs mt-2 leading-relaxed">
                  {spot.shortDesc}
                </p>
                <p className="text-stone-400 text-[11px] font-serif mt-3 italic">
                  {spot.historicalContext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
