import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import {
  Mic,
  X,
  Compass,
  RotateCw,
  ZoomIn,
  Play,
  MapPin,
  Camera,
  Volume2,
  Sparkles,
  Sun,
  Moon,
  Hand,
  Maximize2,
} from 'lucide-react'

export const VoiceHelpModal: React.FC = () => {
  const showHelp = useExperienceStore((s) => s.showVoiceHelp)
  const setShowVoiceHelp = useExperienceStore((s) => s.setShowVoiceHelp)

  if (!showHelp) return null

  const categories = [
    {
      title: 'Solar & Lunar Sky Illumination',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      commands: [
        { phrase: '"Day" / "Sun" / "Sunlight"', action: 'Calibrated 5400K golden morning sunlight with long shadows' },
        { phrase: '"Night" / "Moon" / "Moonlight"', action: 'Silvery moonlight, Pleiades star cluster & glowing deepams' },
        { phrase: '"Toggle Lighting" / "Switch Light"', action: 'Toggles between sacred morning and midnight illumination' },
      ],
    },
    {
      title: 'Archaeological Photo Archive',
      icon: <Camera className="w-4 h-4 text-purple-400" />,
      commands: [
        { phrase: '"Gallery" / "Photos" / "Archive"', action: 'Opens curated 10-image authentic archaeological gallery' },
        { phrase: '"Next Photo" / "Next Image"', action: 'Advances to next photograph with historical notes' },
        { phrase: '"Previous Photo" / "Prev Image"', action: 'Cycles back to previous photograph' },
        { phrase: '"Close" / "Exit"', action: 'Dismisses active photo modal or timeline' },
      ],
    },
    {
      title: 'Navigation & Sacred Journey',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      commands: [
        { phrase: '"Forward" / "Ahead" / "Advance"', action: 'Moves forward along the cinematic spline (+6%)' },
        { phrase: '"Backward" / "Back" / "Retreat"', action: 'Moves backward along the path (-6%)' },
        { phrase: '"Stop" / "Pause"', action: 'Pauses cinematic camera movement' },
        { phrase: '"Play" / "Resume"', action: 'Resumes cinematic movement' },
      ],
    },
    {
      title: 'Camera Orbit & Zoom',
      icon: <RotateCw className="w-4 h-4 text-emerald-400" />,
      commands: [
        { phrase: '"Rotate Right" / "Turn Right"', action: 'Orbits camera clockwise (+16°)' },
        { phrase: '"Rotate Left" / "Turn Left"', action: 'Orbits camera counter-clockwise (-16°)' },
        { phrase: '"Reset View" / "Center"', action: 'Resets camera rotation to natural facing' },
        { phrase: '"Zoom In" / "Closer"', action: 'Magnifies architectural masonry & inscriptions (+0.35x)' },
        { phrase: '"Zoom Out" / "Reset Zoom"', action: 'Zooms out or restores default 1.0x view' },
      ],
    },
    {
      title: 'AI Hand Motion Tracking',
      icon: <Hand className="w-4 h-4 text-cyan-400" />,
      commands: [
        { phrase: '"Enable Hands" / "Hand Tracking"', action: 'Activates webcam MediaPipe hand gesture controls' },
        { phrase: '"Stop Hands" / "Disable Hands"', action: 'Powers off camera feed and hand tracking HUD' },
      ],
    },
    {
      title: 'Sacred Hotspots & Epigraphy',
      icon: <MapPin className="w-4 h-4 text-amber-300" />,
      commands: [
        { phrase: '"Kumbam" / "Kalasam"', action: 'Inspects 81-ton monolithic granite apex & stupi' },
        { phrase: '"Vimana" / "Tower"', action: 'Focuses soaring 66-meter Sri Vimana pyramid' },
        { phrase: '"Inscriptions" / "Tamil"', action: 'Inspects Rajaraja Chola Old Tamil granite epigraphy' },
        { phrase: '"Mandapa" / "Hall"', action: 'Inspects pillared Maha Mandapa assembly' },
        { phrase: '"Kodimaram" / "Flag"', action: 'Focuses Kodimaram Flag Mast & Bali Peetham' },
        { phrase: '"Nandi" / "Bull"', action: 'Inspects 20-ton monolithic Nandi pavilion' },
        { phrase: '"Lingam" / "Sanctum"', action: 'Enters Garbhagriha to venerate Maha Lingam' },
      ],
    },
    {
      title: 'Heritage Chant & System',
      icon: <Volume2 className="w-4 h-4 text-rose-400" />,
      commands: [
        { phrase: '"Mantra" / "Chant"', action: 'Jump to Lingam & chants Maha Mrityunjaya Mantra' },
        { phrase: '"Timeline" / "History"', action: 'Opens Chola dynasty architectural timeline' },
        { phrase: '"Audio" / "Mute"', action: 'Toggles sacred temple bells and drone music' },
        { phrase: '"Fullscreen"', action: 'Toggles edge-to-edge cinematic fullscreen' },
      ],
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setShowVoiceHelp(false)}
    >
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#16120e] to-[#0a0807] border border-amber-500/40 shadow-[0_0_50px_rgba(217,119,6,0.2)] p-6 md:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-help-title" className="text-xl font-serif text-amber-100 font-semibold tracking-wide flex items-center gap-2">
                <span>Voice Commands Cheatsheet</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                  AI SPEECH
                </span>
              </h2>
              <p className="text-stone-400 text-xs font-mono mt-0.5">
                Speak clearly into your microphone while Voice Control is active
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowVoiceHelp(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider mb-2">
                {cat.icon}
                <span>{cat.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.commands.map((cmd) => (
                  <div
                    key={cmd.phrase}
                    className="p-2 rounded-lg bg-black/40 border border-stone-800/50 flex flex-col gap-0.5"
                  >
                    <span className="font-mono text-xs text-cyan-300 font-semibold">
                      {cmd.phrase}
                    </span>
                    <span className="text-[11px] text-stone-400 leading-tight">
                      {cmd.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Say &quot;Help&quot; anytime to bring up this cheatsheet</span>
          </div>
          <button
            type="button"
            onClick={() => setShowVoiceHelp(false)}
            className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-mono transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoiceHelpModal
