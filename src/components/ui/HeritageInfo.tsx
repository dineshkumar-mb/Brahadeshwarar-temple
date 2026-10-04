import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { Camera, Sparkles, Volume2, VolumeX } from 'lucide-react'

export const HeritageInfo: React.FC = () => {
  const currentSection = useExperienceStore((s) => s.currentSection)
  const isFocusMode = useExperienceStore((s) => s.isFocusMode)
  const activeHotspotId = useExperienceStore((s) => s.activeHotspotId)
  const openPhotoModal = useExperienceStore((s) => s.openPhotoModal)
  const isAudioMuted = useExperienceStore((s) => s.isAudioMuted)
  const isMantraActive = useExperienceStore((s) => s.isMantraActive)
  const toggleAudio = useExperienceStore((s) => s.toggleAudio)
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)

  if (isFocusMode && activeHotspotId) return null

  const isNearLingam = Math.abs(sceneProgress - 0.72) < 0.10 || currentSection === 4

  // Aligned architectural annotations matching exactly the 8 choreographed camera waypoints
  const annotations = [
    {
      title: 'KERALANTAKAN GOPURAM',
      subtitle: 'CEREMONIAL GATEWAY',
      meta: 'IMPERIAL CHOLA ENTRANCE • 1010 CE',
      photoLabel: 'View Entrance Photo',
      imageRef: '/images/temple/entrance.jpg',
      tamilTitle: 'கேரளாந்தகன் திருவாயில்',
      details:
        'Built to commemorate Rajaraja I victory over the Cheras at Kandalur Salai, this entrance features two gargantuan Dvarapalas (gatekeepers) carved with coiled serpents, fierce expressions, and raised clubs.',
      gallery: [
        '/images/temple/entrance.jpg',
        '/images/temple/entrance.webp',
        '/images/temple/gopuram-sideview.webp',
        '/images/temple/gopuram-backsideview.webp',
      ],
    },
    {
      title: 'SACRED APPROACH & KODIMARAM',
      subtitle: 'AXIAL PROCESSION & DHWAJASTHAMBHA',
      meta: 'KODIMARAM • BALI PEETHAM • COURTYARD',
      photoLabel: 'View Kodimaram Photo',
      imageRef: '/kodimaram.jpg',
      tamilTitle: 'பிராகார நடைபாதை & கொடிமரம்',
      details:
        'The vast granite courtyard features the soaring Kodimaram (Dhwajasthambham) encased in ribbed copper and brass plates with suspended temple bells, alongside the monolithic Bali Peetham and the cloistered pillared corridors leading to the Nandi Mandapam.',
      gallery: [
        '/kodimaram.jpg',
        '/images/temple/side-view.webp',
        '/images/temple/right-sideview.webp',
        '/images/temple/entrance.jpg',
      ],
    },
    {
      title: 'SRI VIMANA',
      subtitle: 'DAKSHINA MERU',
      meta: '216 FT (66M) MONUMENTAL TOWER',
      photoLabel: 'View Vimana Photo',
      imageRef: '/images/temple/right-sideview.webp',
      tamilTitle: 'ஸ்ரீ விமானம் • தென்திசை மேரு',
      details:
        'Towering 13 diminishing talas of interlocking granite rising at a steep 75-degree angle, crowned with an 80-tonne monolithic dome.',
      gallery: [
        '/images/temple/right-sideview.webp',
        '/images/temple/side-view.webp',
        '/images/temple/gopuram-sideview.webp',
      ],
    },
    {
      title: 'ARCHITECTURAL ELEVATION',
      subtitle: '13 MONUMENTAL TALAS',
      meta: 'INTERLOCKING GRANITE ENGINEERING',
      photoLabel: 'View Architecture Photo',
      imageRef: '/images/temple/gopuram-sideview.webp',
      tamilTitle: 'தள அமைப்பு மற்றும் சிற்பங்கள்',
      details:
        'Flawlessly calculated mathematical taper rising without binding mortar, enduring over a millennium of seismic activity and monsoon winds.',
      gallery: [
        '/images/temple/gopuram-sideview.webp',
        '/images/temple/right-sideview.webp',
        '/images/temple/gopuram-backsideview.webp',
      ],
    },
    {
      title: 'PERUVUDAIYAR MAHA LINGAM',
      subtitle: 'THE SACRED SANCTUM (GARBHAGRIHA)',
      meta: 'COSMIC PILLAR OF LIGHT • ADAVALLAN',
      photoLabel: 'View Sanctum Photo (Lingam)',
      imageRef: '/images/lingam.jpg',
      tamilTitle: 'பெரியவுடையார் மகாலிங்கம்',
      details:
        'Enshrined inside the double-walled granite Garbhagriha directly beneath the soaring 66-meter Sri Vimana, this colossal monolithic 13-foot black granite Lingam was consecrated as Adavallan (The Master of Dance) and Dakshina Meru Vitankan by Emperor Rajaraja I in 1010 CE. Decorated with sacred Vibhuti Tripundra, holy rudrakshas, and fresh flower garlands, illuminated by tiered bronze deepam lamps in unbroken daily worship.',
      gallery: [
        '/images/lingam.jpg',
        '/images/temple/entrance.jpg',
        '/images/temple/nandhi-sideview.jpg',
        '/images/temple/nandhi-backsideview.jpg',
      ],
    },
    {
      title: 'COLOSSAL NANDI BULL',
      subtitle: 'MONOLITHIC GUARDIAN',
      meta: '25-TONNE MONOLITHIC GRANITE',
      photoLabel: 'View Nandi Photos',
      imageRef: '/images/temple/nandhi-sideview.jpg',
      tamilTitle: 'பெரிய நந்தி பெருமான்',
      details:
        'Carved from a single massive boulder of deep greenish-black granite, this colossal Nandi is adorned with sculpted brass bell necklaces and floral malas, housed within an ornate hypostyle mandapa featuring vibrant 16th-century tempera ceiling frescoes.',
      gallery: [
        '/images/temple/nandhi-sideview.jpg',
        '/images/temple/nandhi-backsideview.jpg',
        '/images/lingam.jpg',
      ],
    },
    {
      title: 'OCTAGONAL SIKHARA',
      subtitle: '80-TONNE MONOLITHIC CUPOLA',
      meta: 'CROWNED BY GILDED KALASAM',
      photoLabel: 'View Summit Architecture',
      imageRef: '/images/temple/gopuram-backsideview.webp',
      tamilTitle: 'சிகரம் மற்றும் தங்கக் கலசம்',
      details:
        'A single massive octagonal granite block weighing 80 tonnes, hoisted 66 meters above ground along a 6-kilometer inclined earthen ramp, crowned with a gilded copper Stupi Kalasam.',
      gallery: [
        '/images/temple/gopuram-backsideview.webp',
        '/images/temple/gopuram-sideview.webp',
        '/images/lingam.jpg',
      ],
    },
    {
      title: 'LIVING CHOLA TEMPLES',
      subtitle: 'UNESCO WORLD HERITAGE',
      meta: 'PERUVUDAIYAR KOVIL • THANJAVUR',
      photoLabel: 'View Heritage Photo',
      imageRef: '/images/temple/entrance.webp',
      tamilTitle: 'வாழ்வியல் சோழர் கோயில்கள்',
      details:
        'A designated UNESCO World Heritage Monument standing as the crowning achievement of Dravidian temple architecture and living Chola cultural tradition.',
      gallery: [
        '/images/temple/entrance.webp',
        '/images/lingam.jpg',
        '/images/temple/entrance.jpg',
        '/images/temple/nandhi-sideview.jpg',
      ],
    },
  ]

  const active = annotations[currentSection] || annotations[0]

  const handleOpenPhoto = () => {
    openPhotoModal({
      title: active.title,
      tamilTitle: active.tamilTitle,
      imageSrc: active.imageRef,
      caption: active.subtitle,
      details: active.details,
      galleryImages: active.gallery,
    })
  }

  return (
    <div
      aria-label="Architectural Annotation"
      className="fixed top-6 left-6 z-20 pointer-events-none select-none text-left"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-amber-400/90 uppercase">
          {active.meta}
        </span>
      </div>

      <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-amber-100 drop-shadow-md">
        {active.title}
      </h1>

      <span className="block font-mono text-[11px] tracking-widest text-stone-400 uppercase mt-0.5">
        {active.subtitle}
      </span>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {/* Instant Authentic Photography Pill Button */}
        <button
          type="button"
          onClick={handleOpenPhoto}
          className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono tracking-wider transition-all duration-200 shadow-xl cursor-pointer group"
          title="View authentic archaeological photography for this structure"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>{active.photoLabel}</span>
        </button>

        {/* Sacred Maha Mrityunjaya Mantra Chanting Badge when near Lingam screen */}
        {isNearLingam && (
          !isAudioMuted ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/85 border border-amber-500/50 text-amber-200 text-xs shadow-xl backdrop-blur-md animate-pulse">
              <span className="text-amber-400 font-bold text-sm">ॐ</span>
              <span className="font-serif tracking-wide text-[11px] text-amber-200">
                Maha Mrityunjaya Mantra Chanting
              </span>
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleAudio}
              className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono shadow-xl transition-all cursor-pointer group"
              title="Click to unmute sacred Maha Mrityunjaya Mantra chanting"
            >
              <VolumeX className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px]">Unmute Lingam Mantra</span>
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default HeritageInfo
