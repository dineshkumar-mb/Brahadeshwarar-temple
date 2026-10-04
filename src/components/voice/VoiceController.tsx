import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { inputController } from '../input/InputController'
import { templeAudio } from '../../audio/TempleAudio'
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// Browser Web Speech API type definition
type SpeechRecognitionType = any

export const VoiceController: React.FC = () => {
  const isVoiceEnabled = useExperienceStore((s) => s.isVoiceEnabled)
  const isVoiceListening = useExperienceStore((s) => s.isVoiceListening)
  const setVoiceListening = useExperienceStore((s) => s.setVoiceListening)
  const setVoiceEnabled = useExperienceStore((s) => s.setVoiceEnabled)
  const lastVoiceCommand = useExperienceStore((s) => s.lastVoiceCommand)
  const setLastVoiceCommand = useExperienceStore((s) => s.setLastVoiceCommand)
  const voiceTranscript = useExperienceStore((s) => s.voiceTranscript)
  const setVoiceTranscript = useExperienceStore((s) => s.setVoiceTranscript)
  const setShowVoiceHelp = useExperienceStore((s) => s.setShowVoiceHelp)

  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null)
  const [speechSupported, setSpeechSupported] = useState<boolean>(true)
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false)

  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const noticeTimerRef = useRef<number | null>(null)

  const showActionFeedback = useCallback((notice: string) => {
    setLastActionNotice(notice)
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setLastActionNotice(null)
    }, 3200)
  }, [])

  // Process incoming speech text
  const processVoiceCommand = useCallback((rawText: string) => {
    const text = rawText.toLowerCase().trim()
    setVoiceTranscript(text)
    const store = useExperienceStore.getState()

    // 1. FORWARD / ADVANCE
    if (
      text.includes('forward') ||
      text.includes('ahead') ||
      text.includes('advance') ||
      text.includes('next') ||
      text.includes('go on')
    ) {
      inputController.addProgress(0.065, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Forward')
      showActionFeedback('✓ ADVANCED FORWARD (+6%)')
      return
    }

    // 2. BACKWARD / RETREAT
    if (
      text.includes('backward') ||
      text.includes('back') ||
      text.includes('retreat') ||
      text.includes('reverse') ||
      text.includes('previous')
    ) {
      inputController.addProgress(-0.065, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Backward')
      showActionFeedback('✓ RETREATED BACKWARD (-6%)')
      return
    }

    // 3. ROTATE RIGHT / ORBIT RIGHT
    if (
      text.includes('rotate right') ||
      text.includes('turn right') ||
      text.includes('orbit right') ||
      text.includes('spin right')
    ) {
      inputController.addOrbit(0.28, 0, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Rotate Right')
      showActionFeedback('✓ ORBITED RIGHT (+16°)')
      return
    }

    // 4. ROTATE LEFT / ORBIT LEFT
    if (
      text.includes('rotate left') ||
      text.includes('turn left') ||
      text.includes('orbit left') ||
      text.includes('spin left')
    ) {
      inputController.addOrbit(-0.28, 0, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Rotate Left')
      showActionFeedback('✓ ORBITED LEFT (-16°)')
      return
    }

    // 5. ROTATE / ORBIT (General rotation)
    if (text.includes('rotate') || text.includes('orbit') || text.includes('turn') || text.includes('spin')) {
      inputController.addOrbit(0.24, 0, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Rotate')
      showActionFeedback('✓ ROTATING CAMERA (+14°)')
      return
    }

    // 6. RESET VIEW / ROTATION
    if (
      text.includes('reset view') ||
      text.includes('reset rotation') ||
      text.includes('center view') ||
      text.includes('reset camera') ||
      text.includes('face front')
    ) {
      inputController.resetOrbit()
      templeAudio.playTempleBell()
      setLastVoiceCommand('Reset View')
      showActionFeedback('✓ RESET CAMERA ROTATION')
      return
    }

    // 7. ZOOM IN
    if (
      text.includes('zoom in') ||
      text.includes('closer') ||
      text.includes('magnify') ||
      text.includes('inspect')
    ) {
      inputController.addZoom(0.35, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Zoom In')
      showActionFeedback('✓ ZOOMED IN (+0.35x)')
      return
    }

    // 8. ZOOM OUT
    if (
      text.includes('zoom out') ||
      text.includes('zoom back') ||
      text.includes('wider') ||
      text.includes('zoom away')
    ) {
      inputController.addZoom(-0.35, 'mouse')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Zoom Out')
      showActionFeedback('✓ ZOOMED OUT (-0.35x)')
      return
    }

    // 9. RESET ZOOM
    if (text.includes('reset zoom') || text.includes('normal zoom') || text.includes('default zoom')) {
      store.setZoomFactor(1.0)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Reset Zoom')
      showActionFeedback('✓ RESET ZOOM TO 1.0x')
      return
    }

    // 10. PAUSE / STOP / HOLD
    if (
      text.includes('stop') ||
      text.includes('pause') ||
      text.includes('hold') ||
      text.includes('freeze')
    ) {
      if (!store.isPaused) {
        store.togglePause()
        templeAudio.playTempleBell()
        setLastVoiceCommand('Pause')
        showActionFeedback('✓ PAUSED CINEMATIC MOTION')
      }
      return
    }

    // 11. PLAY / RESUME
    if (
      text.includes('play') ||
      text.includes('resume') ||
      text.includes('continue') ||
      text.includes('start')
    ) {
      if (store.isPaused) {
        store.togglePause()
        templeAudio.playTempleBell()
        setLastVoiceCommand('Resume')
        showActionFeedback('✓ RESUMED CINEMATIC MOTION')
      }
      return
    }

    // 12. CHAPTER JUMPS
    if (text.includes('entrance') || text.includes('gateway') || text.includes('gopuram')) {
      store.jumpToSection(0)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Entrance Gopuram')
      showActionFeedback('✓ JUMPED TO: Keralantakan Gopuram')
      return
    }

    if (text.includes('approach') || text.includes('courtyard')) {
      store.jumpToSection(1)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Sacred Approach')
      showActionFeedback('✓ JUMPED TO: Sacred Approach')
      return
    }

    if (text.includes('vimana') || text.includes('tower') || text.includes('shikhara')) {
      store.jumpToSection(2)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Celestial Vimana')
      showActionFeedback('✓ JUMPED TO: Celestial Vimana')
      return
    }

    if (text.includes('mantra') || text.includes('chant') || text.includes('tryambakam')) {
      if (store.isAudioMuted) {
        store.toggleAudio()
      }
      store.jumpToSection(4)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Maha Mrityunjaya Mantra')
      showActionFeedback('✓ PLAYING SACRED MANTRA AT LINGAM')
      return
    }

    if (text.includes('sanctum') || text.includes('lingam') || text.includes('garbhagriha')) {
      store.jumpToSection(4)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Sanctum Lingam')
      showActionFeedback('✓ JUMPED TO: Garbhagriha Sanctum')
      return
    }

    if (text.includes('nandi') || text.includes('bull')) {
      store.jumpToSection(5)
      templeAudio.playTempleBell()
      setLastVoiceCommand('Nandi Mandapam')
      showActionFeedback('✓ JUMPED TO: Monolithic Nandi')
      return
    }

    if (
      text.includes('kodimaram') ||
      text.includes('kodi maram') ||
      text.includes('flag') ||
      text.includes('dhwaja') ||
      text.includes('stambha') ||
      text.includes('bali')
    ) {
      store.activateHotspot('kodimaram')
      templeAudio.playTempleBell()
      setLastVoiceCommand('Kodimaram Flag Mast')
      showActionFeedback('✓ FOCUSING: Kodimaram & Bali Peetham')
      return
    }

    if (text.includes('timeline') || text.includes('history')) {
      useExperienceStore.setState((s) => ({ isTimelineOpen: !s.isTimelineOpen }))
      templeAudio.playTempleBell()
      setLastVoiceCommand('Timeline')
      showActionFeedback('✓ TOGGLED HISTORICAL TIMELINE')
      return
    }

    if (text.includes('gallery') || text.includes('photo') || text.includes('picture')) {
      store.openPhotoModal({
        title: 'Peruvudaiyar Maha Lingam & Sacred Sanctum',
        tamilTitle: 'பெரியவுடையார் மகாலிங்கம்',
        imageSrc: '/images/lingam.jpg',
        caption: 'Enshrined within the sacred double-walled Garbhagriha under the soaring 66-meter Sri Vimana.',
        details:
          'Concurring with classical Agama shastras, the 13-foot monolithic black granite Lingam rests on a 54-foot circumference Avudaiyar.',
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
      templeAudio.playTempleBell()
      setLastVoiceCommand('Gallery')
      showActionFeedback('✓ OPENED ARCHAEOLOGICAL GALLERY')
      return
    }

    if (text.includes('close') || text.includes('dismiss') || text.includes('exit')) {
      store.closePhotoModal()
      useExperienceStore.setState({ isTimelineOpen: false, showVoiceHelp: false })
      showActionFeedback('✓ DISMISSED MODALS')
      return
    }

    if (text.includes('audio') || text.includes('sound') || text.includes('music') || text.includes('mute')) {
      store.toggleAudio()
      setLastVoiceCommand('Audio Toggle')
      showActionFeedback('✓ TOGGLED TEMPLE AUDIO')
      return
    }

    if (text.includes('help') || text.includes('commands')) {
      store.setShowVoiceHelp(true)
      showActionFeedback('✓ DISPLAYING VOICE COMMANDS')
      return
    }

    // Unrecognized speech
    setLastVoiceCommand(null)
    showActionFeedback(`Hearing: "${text}" (say "help" for commands)`)
  }, [setVoiceTranscript, setLastVoiceCommand, showActionFeedback])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    let isCancelled = false

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 2

      recognition.onstart = () => {
        if (!isCancelled) {
          setVoiceListening(true)
          setMicPermissionDenied(false)
        }
      }

      recognition.onresult = (event: any) => {
        if (isCancelled) return
        const lastIdx = event.results.length - 1
        const result = event.results[lastIdx]
        if (result && result.isFinal) {
          const transcript = result[0].transcript
          processVoiceCommand(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionDenied(true)
          setVoiceListening(false)
          setVoiceEnabled(false)
        }
      }

      recognition.onend = () => {
        // Auto-restart if voice is still enabled
        if (!isCancelled && useExperienceStore.getState().isVoiceEnabled) {
          try {
            recognition.start()
          } catch {
            // Already active or error
          }
        } else {
          setVoiceListening(false)
        }
      }

      recognitionRef.current = recognition
    } catch (err) {
      console.warn('SpeechRecognition initialization failed:', err)
      setSpeechSupported(false)
    }

    return () => {
      isCancelled = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
    }
  }, [processVoiceCommand, setVoiceListening, setVoiceEnabled])

  // Start or Stop recognition when isVoiceEnabled changes
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isVoiceEnabled) {
      try {
        recognition.start()
      } catch {
        // Already started or restarting
      }
    } else {
      try {
        recognition.stop()
      } catch {}
      setVoiceListening(false)
      setLastActionNotice(null)
    }
  }, [isVoiceEnabled, setVoiceListening])

  if (!isVoiceEnabled) return null

  return (
    <aside
      aria-label="Voice Command Active Indicator"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-40 select-none flex flex-col items-center gap-1.5 pointer-events-auto"
    >
      {/* Floating Listening Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/85 border border-amber-500/50 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.85)] text-xs font-mono tracking-wider transition-all duration-300">
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className="absolute w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </div>

        <span className="text-stone-200 font-semibold text-[11px] flex items-center gap-1">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span>VOICE LISTENING</span>
        </span>

        <span className="text-stone-700">|</span>

        {/* Command Help Modal Trigger */}
        <button
          type="button"
          onClick={() => setShowVoiceHelp(true)}
          className="flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer text-[10px]"
          title="View all voice commands"
        >
          <HelpCircle className="w-3 h-3" />
          <span>COMMANDS</span>
        </button>

        {/* Close Voice Button */}
        <button
          type="button"
          onClick={() => setVoiceEnabled(false)}
          className="text-stone-500 hover:text-stone-300 transition-colors cursor-pointer ml-0.5"
          title="Disable voice commands"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Real-time Action / Feedback Notification Toast */}
      {lastActionNotice && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/90 to-stone-950/90 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-lg text-amber-200 font-mono text-[11px] font-semibold animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-spin" />
          <span>{lastActionNotice}</span>
        </div>
      )}

      {/* Browser Not Supported Warning */}
      {!speechSupported && (
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[10px]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Web Speech API not supported in this browser. Use Chrome or Edge.</span>
        </div>
      )}

      {/* Microphone Denied Warning */}
      {micPermissionDenied && (
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[10px]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Microphone permission denied. Allow mic access in browser settings.</span>
        </div>
      )}
    </aside>
  )
}

export default VoiceController
