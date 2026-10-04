import React from 'react'
import {
  useExperienceStore,
  SECTION_MILESTONES,
} from '../../state/experienceStore'
import {
  Hand,
  Mouse,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Sliders,
  Bug,
  Activity,
  Maximize2,
  Minimize2,
  Camera,
  Mic,
  MicOff,
  Sun,
  Moon,
} from 'lucide-react'

export const CinematicProgress: React.FC = () => {
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)
  const targetProgress = useExperienceStore((s) => s.targetProgress)
  const currentSection = useExperienceStore((s) => s.currentSection)
  const jumpToSection = useExperienceStore((s) => s.jumpToSection)
  const isHandTrackingEnabled = useExperienceStore((s) => s.isHandTrackingEnabled)
  const setHandTrackingEnabled = useExperienceStore((s) => s.setHandTrackingEnabled)
  const isVoiceEnabled = useExperienceStore((s) => s.isVoiceEnabled)
  const setVoiceEnabled = useExperienceStore((s) => s.setVoiceEnabled)
  const isAudioMuted = useExperienceStore((s) => s.isAudioMuted)
  const isMantraActive = useExperienceStore((s) => s.isMantraActive)
  const toggleAudio = useExperienceStore((s) => s.toggleAudio)
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const toggleTimeOfDay = useExperienceStore((s) => s.toggleTimeOfDay)
  const isDebugMode = useExperienceStore((s) => s.isDebugMode)
  const toggleDebugMode = useExperienceStore((s) => s.toggleDebugMode)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion)
  const toggleTimeline = () =>
    useExperienceStore.setState((s) => ({ isTimelineOpen: !s.isTimelineOpen }))
  const openPhotoModal = useExperienceStore((s) => s.openPhotoModal)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const progressPercent = Math.round(sceneProgress * 100)

  return (
    <nav
      aria-label="Cinematic navigation and controls"
      className="fixed bottom-0 left-0 right-0 z-30 p-4 md:p-6 pointer-events-none"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Milestone Steps */}
        <div className="flex items-center justify-between pointer-events-auto px-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {SECTION_MILESTONES.map((sec, idx) => {
              const isActive = currentSection === idx
              const isPassed = sceneProgress >= sec.range[0]

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => jumpToSection(idx)}
                  className={`group relative flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : isPassed
                      ? 'text-stone-300 hover:text-amber-300'
                      : 'text-stone-600 hover:text-stone-400'
                  }`}
                  title={`${sec.label} (${Math.round(sec.progress * 100)}%)`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      isActive
                        ? 'bg-amber-400 scale-125'
                        : isPassed
                        ? 'bg-amber-600'
                        : 'bg-stone-700'
                    }`}
                  />
                  <span className="hidden md:inline text-[11px] font-medium">
                    {idx === 4 ? '🕉️ ' : `${idx + 1}. `}{sec.label}
                  </span>
                  <span className="md:hidden text-[10px]">
                    {idx + 1}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Current percentage indicator */}
          <div className="text-right font-mono text-xs text-amber-300/80 pl-2">
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Continuous Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cinematic scene progress"
          className="relative w-full h-1 bg-stone-900/80 rounded-full overflow-hidden border border-stone-800 pointer-events-auto cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickPos = (e.clientX - rect.left) / rect.width
            useExperienceStore.getState().setTargetProgress(clickPos)
          }}
        >
          {/* Target indicator subtle line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-400/40"
            style={{ left: `${targetProgress * 100}%` }}
          />
          {/* Interpolated progress fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-75"
            style={{ width: `${sceneProgress * 100}%` }}
          />
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center justify-between pt-1 pointer-events-auto">
          {/* Left: Input Mode Quick Switch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHandTrackingEnabled(!isHandTrackingEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wider transition-all cursor-pointer ${
                isHandTrackingEnabled
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {isHandTrackingEnabled ? (
                <>
                  <Hand className="w-3.5 h-3.5 text-amber-400" />
                  <span>HAND GESTURES</span>
                </>
              ) : (
                <>
                  <Mouse className="w-3.5 h-3.5 text-stone-400" />
                  <span>MOUSE / TOUCH</span>
                </>
              )}
            </button>

            {/* Voice Control Toggle Button */}
            <button
              type="button"
              onClick={() => setVoiceEnabled(!isVoiceEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wider transition-all cursor-pointer ${
                isVoiceEnabled
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title={isVoiceEnabled ? 'Disable Voice Commands' : 'Enable Voice Commands (forward, backward, rotate, zoom)'}
            >
              {isVoiceEnabled ? (
                <>
                  <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>VOICE ON</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-stone-400" />
                  <span>VOICE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleTimeline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/70 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-mono tracking-wider transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TIMELINE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openPhotoModal({
                  title: 'Peruvudaiyar Maha Lingam & Sacred Sanctum',
                  tamilTitle: 'பெரியவுடையார் மகாலிங்கம்',
                  imageSrc: '/images/lingam.jpg',
                  caption: 'Enshrined within the sacred double-walled Garbhagriha under the soaring 66-meter Sri Vimana.',
                  details:
                    'Concurring with classical Agama shastras, the 13-foot monolithic black granite Lingam rests on a 54-foot circumference Avudaiyar, attended by multi-tiered bronze Aarti deepam lamps in continuous worship since 1010 CE.',
                  galleryImages: [
                    '/images/lingam.jpg',
                    '/images/temple/entrance.jpg',
                    '/images/temple/nandhi-sideview.jpg',
                    '/images/temple/nandhi-backsideview.jpg',
                    '/images/temple/side-view.webp',
                    '/images/temple/right-sideview.webp',
                    '/images/temple/gopuram-sideview.webp',
                    '/images/temple/gopuram-backsideview.webp',
                  ],
                })
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/70 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs font-mono tracking-wider transition-all cursor-pointer"
              title="Archaeological Photography & Real Heritage Archive"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GALLERY</span>
            </button>
          </div>

          {/* Right: Audio, Motion, Debug, Fullscreen */}
          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-2 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                isMantraActive
                  ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                  : !isAudioMuted
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-stone-900/70 border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
              title={
                isMantraActive
                  ? '🕉️ Maha Mrityunjaya Mantra Chanting Active (Click to Mute)'
                  : !isAudioMuted
                  ? 'Mute Temple Ambient Sound'
                  : 'Enable Temple Ambient Drone & Bells'
              }
            >
              {!isAudioMuted ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            {/* ☀ / 🌕 Day — Night Toggle */}
            <button
              type="button"
              onClick={toggleTimeOfDay}
              className={`p-2 rounded-full border text-xs font-mono transition-all duration-300 cursor-pointer ${
                timeOfDay === 'night'
                  ? 'bg-indigo-950/70 border-indigo-400/50 text-indigo-200 shadow-[0_0_12px_rgba(100,120,255,0.35)]'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,180,40,0.25)]'
              }`}
              title={
                timeOfDay === 'day'
                  ? '🌕 Switch to Moonlight Night Mode'
                  : '☀️ Switch to Sunlight Day Mode'
              }
            >
              {timeOfDay === 'day' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Reduced Motion Toggle */}
            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-2.5 py-1.5 rounded-full border text-[11px] font-mono tracking-wider transition-all cursor-pointer hidden sm:flex items-center gap-1 ${
                reducedMotion
                  ? 'bg-sky-950/70 border-sky-400/50 text-sky-300'
                  : 'bg-stone-900/70 border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
              title="Toggle Reduced Motion"
            >
              <Activity className="w-3 h-3" />
              <span>REDUCED MOTION</span>
            </button>

            {/* Debug Mode Toggle */}
            <button
              type="button"
              onClick={toggleDebugMode}
              className={`p-2 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                isDebugMode
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-stone-900/70 border-stone-800 text-stone-500 hover:text-stone-300'
              }`}
              title="Developer Debug HUD (Press D)"
            >
              <Bug className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-stone-900/70 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-mono transition-all cursor-pointer"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
