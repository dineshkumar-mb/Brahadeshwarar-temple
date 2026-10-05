import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { inputController } from '../input/InputController'
import { templeAudio } from '../../audio/TempleAudio'
import { ARCHAEOLOGICAL_GALLERY } from '../../data/templeData'
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
  const lastExecutedCommandTimeRef = useRef<number>(0)
  const lastMatchedKeyRef = useRef<string>('')
  const restartTimeoutRef = useRef<number | null>(null)

  const showActionFeedback = useCallback((notice: string) => {
    setLastActionNotice(notice)
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setLastActionNotice(null)
    }, 3200)
  }, [])

  // Process incoming speech text with low-latency interim & final execution
  const processVoiceCommand = useCallback((rawText: string, isFinal = false) => {
    const text = rawText.toLowerCase().trim()
    setVoiceTranscript(text)
    const store = useExperienceStore.getState()
    const now = performance.now()

    // Helper to debounce command execution across continuous interim transcripts
    const tryExecute = (key: string, cooldownMs: number, action: () => void) => {
      if (now - lastExecutedCommandTimeRef.current < cooldownMs && lastMatchedKeyRef.current === key) {
        return true
      }
      lastExecutedCommandTimeRef.current = now
      lastMatchedKeyRef.current = key
      action()
      return true
    }

    // 1. SKY ILLUMINATION / DAY & NIGHT
    if (
      text.includes('day') ||
      text.includes('sun') ||
      text.includes('morning') ||
      text.includes('sunlight')
    ) {
      return tryExecute('day', 1200, () => {
        store.setTimeOfDay('day')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Morning Sunlight')
        showActionFeedback('✓ SKY ILLUMINATION: 5400K MORNING SUNLIGHT')
      })
    }

    if (
      text.includes('night') ||
      text.includes('moon') ||
      text.includes('evening') ||
      text.includes('moonlight') ||
      text.includes('dusk')
    ) {
      return tryExecute('night', 1200, () => {
        store.setTimeOfDay('night')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Moonlit Serenity')
        showActionFeedback('✓ SKY ILLUMINATION: SILVERY MOONLIGHT & STARS')
      })
    }

    if (text.includes('toggle lighting') || text.includes('toggle sky') || text.includes('switch light')) {
      return tryExecute('toggle-light', 1000, () => {
        store.toggleTimeOfDay()
        templeAudio.playTempleBell()
        setLastVoiceCommand('Toggle Sky Lighting')
        showActionFeedback(`✓ SKY TOGGLED TO: ${store.timeOfDay === 'day' ? 'NIGHT' : 'DAY'}`)
      })
    }

    // 2. HAND TRACKING MOTION CONTROL
    if (
      (text.includes('hand') || text.includes('gesture')) &&
      (text.includes('start') || text.includes('enable') || text.includes('on') || text.includes('track'))
    ) {
      return tryExecute('hand-on', 1500, () => {
        store.setHandTrackingEnabled(true)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Hand Tracking Enabled')
        showActionFeedback('✓ HAND MOTION TRACKING ACTIVATED')
      })
    }

    if (
      (text.includes('hand') || text.includes('gesture')) &&
      (text.includes('stop') || text.includes('disable') || text.includes('off') || text.includes('turn off'))
    ) {
      return tryExecute('hand-off', 1500, () => {
        store.setHandTrackingEnabled(false)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Hand Tracking Disabled')
        showActionFeedback('✓ HAND MOTION TRACKING DISABLED')
      })
    }

    // 3. ARCHAEOLOGICAL GALLERY ARCHIVE & NAVIGATION
    if (text.includes('next photo') || text.includes('next image') || text.includes('next picture')) {
      return tryExecute('next-photo', 450, () => {
        store.navigatePhotoModal(1)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Next Photo')
        showActionFeedback('✓ GALLERY: ADVANCED TO NEXT PHOTO')
      })
    }

    if (
      text.includes('previous photo') ||
      text.includes('prev photo') ||
      text.includes('previous image') ||
      text.includes('prev image')
    ) {
      return tryExecute('prev-photo', 450, () => {
        store.navigatePhotoModal(-1)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Previous Photo')
        showActionFeedback('✓ GALLERY: RETREATED TO PREVIOUS PHOTO')
      })
    }

    if (text.includes('gallery') || text.includes('photo') || text.includes('archive') || text.includes('picture')) {
      return tryExecute('gallery-open', 1500, () => {
        store.openPhotoModal({
          title: 'Brihadisvara Archaeological Photo Archive',
          tamilTitle: 'பெருவுடையார் கோயில் தொல்பொருள் புகைப்படத் தொகுப்பு',
          category: 'Archaeological Archive',
          imageSrc: '/images/lingam.jpg',
          caption: 'Curated 1000-year Chola architectural photography capturing the sanctum, vimana, monolithic Nandi, and granite epigraphy.',
          details: 'Comprehensive photographic survey of Rajaraja Chola I’s masterwork (1010 CE), recognized as a UNESCO World Heritage monument.',
          galleryImages: ARCHAEOLOGICAL_GALLERY.map((p) => p.imageSrc),
        })
        templeAudio.playTempleBell()
        setLastVoiceCommand('Archaeological Archive')
        showActionFeedback('✓ OPENED 10-IMAGE ARCHAEOLOGICAL ARCHIVE')
      })
    }

    // 4. FULLSCREEN TOGGLE
    if (text.includes('full screen') || text.includes('fullscreen')) {
      return tryExecute('fullscreen', 1500, () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {})
          showActionFeedback('✓ ENTERED FULLSCREEN MODE')
        } else {
          document.exitFullscreen?.().catch(() => {})
          showActionFeedback('✓ EXITED FULLSCREEN MODE')
        }
        templeAudio.playTempleBell()
        setLastVoiceCommand('Fullscreen')
      })
    }

    // 5. HOTSPOT INSPECTION
    if (text.includes('kumbam') || text.includes('kalasam') || text.includes('apex') || text.includes('dome')) {
      return tryExecute('hotspot-kumbam', 1200, () => {
        store.activateHotspot('kumbam')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Golden Kumbam')
        showActionFeedback('✓ INSPECTING: 81-Ton Monolithic Kumbam & Golden Stupi')
      })
    }

    if (text.includes('vimana') || text.includes('tower') || text.includes('shikhara')) {
      return tryExecute('hotspot-vimana', 1200, () => {
        store.activateHotspot('vimana')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Sri Vimana')
        showActionFeedback('✓ INSPECTING: Soaring 66m Sri Vimana')
      })
    }

    if (text.includes('inscription') || text.includes('epigraphy') || text.includes('tamil')) {
      return tryExecute('hotspot-inscriptions', 1200, () => {
        store.activateHotspot('inscriptions')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Tamil Epigraphy')
        showActionFeedback('✓ INSPECTING: Rajaraja Chola Old Tamil Inscriptions')
      })
    }

    if (text.includes('mandapa') || text.includes('hall') || text.includes('pillared')) {
      return tryExecute('hotspot-mandapa', 1200, () => {
        store.activateHotspot('mandapa')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Maha Mandapa')
        showActionFeedback('✓ INSPECTING: Pillared Maha Mandapa')
      })
    }

    if (text.includes('kodimaram') || text.includes('flag') || text.includes('bali') || text.includes('stambha')) {
      return tryExecute('hotspot-kodimaram', 1200, () => {
        store.activateHotspot('kodimaram')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Kodimaram Flag Mast')
        showActionFeedback('✓ FOCUSING: Kodimaram & Bali Peetham')
      })
    }

    if (text.includes('nandi') || text.includes('bull')) {
      return tryExecute('hotspot-nandi', 1200, () => {
        store.activateHotspot('nandi')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Monolithic Nandi')
        showActionFeedback('✓ INSPECTING: 20-Ton Monolithic Granite Nandi')
      })
    }

    if (text.includes('sanctum') || text.includes('lingam') || text.includes('garbhagriha')) {
      return tryExecute('hotspot-lingam', 1200, () => {
        store.activateHotspot('lingam')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Maha Lingam')
        showActionFeedback('✓ INSPECTING: Peruvudaiyar Maha Lingam')
      })
    }

    // 6. FORWARD / ADVANCE
    if (
      text.includes('forward') ||
      text.includes('ahead') ||
      text.includes('advance') ||
      text.includes('go on')
    ) {
      return tryExecute('forward', 350, () => {
        inputController.addProgress(0.065, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Forward')
        showActionFeedback('✓ ADVANCED FORWARD (+6%)')
      })
    }

    // 7. BACKWARD / RETREAT
    if (
      text.includes('backward') ||
      text.includes('back') ||
      text.includes('retreat') ||
      text.includes('reverse')
    ) {
      return tryExecute('backward', 350, () => {
        inputController.addProgress(-0.065, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Backward')
        showActionFeedback('✓ RETREATED BACKWARD (-6%)')
      })
    }

    // 8. ROTATE RIGHT / ORBIT RIGHT
    if (
      text.includes('rotate right') ||
      text.includes('turn right') ||
      text.includes('orbit right') ||
      text.includes('spin right')
    ) {
      return tryExecute('rotate-right', 350, () => {
        inputController.addOrbit(0.28, 0, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Rotate Right')
        showActionFeedback('✓ ORBITED RIGHT (+16°)')
      })
    }

    // 9. ROTATE LEFT / ORBIT LEFT
    if (
      text.includes('rotate left') ||
      text.includes('turn left') ||
      text.includes('orbit left') ||
      text.includes('spin left')
    ) {
      return tryExecute('rotate-left', 350, () => {
        inputController.addOrbit(-0.28, 0, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Rotate Left')
        showActionFeedback('✓ ORBITED LEFT (-16°)')
      })
    }

    // 10. ROTATE / ORBIT (General rotation)
    if (text.includes('rotate') || text.includes('orbit') || text.includes('turn') || text.includes('spin')) {
      return tryExecute('rotate', 350, () => {
        inputController.addOrbit(0.24, 0, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Rotate')
        showActionFeedback('✓ ROTATING CAMERA (+14°)')
      })
    }

    // 11. RESET VIEW / ROTATION
    if (
      text.includes('reset view') ||
      text.includes('reset rotation') ||
      text.includes('center view') ||
      text.includes('reset camera') ||
      text.includes('face front')
    ) {
      return tryExecute('reset-view', 800, () => {
        inputController.resetOrbit()
        templeAudio.playTempleBell()
        setLastVoiceCommand('Reset View')
        showActionFeedback('✓ RESET CAMERA ROTATION')
      })
    }

    // 12. ZOOM IN
    if (
      text.includes('zoom in') ||
      text.includes('closer') ||
      text.includes('magnify')
    ) {
      return tryExecute('zoom-in', 350, () => {
        inputController.addZoom(0.35, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Zoom In')
        showActionFeedback('✓ ZOOMED IN (+0.35x)')
      })
    }

    // 13. ZOOM OUT
    if (
      text.includes('zoom out') ||
      text.includes('zoom back') ||
      text.includes('wider') ||
      text.includes('zoom away')
    ) {
      return tryExecute('zoom-out', 350, () => {
        inputController.addZoom(-0.35, 'mouse')
        templeAudio.playTempleBell()
        setLastVoiceCommand('Zoom Out')
        showActionFeedback('✓ ZOOMED OUT (-0.35x)')
      })
    }

    // 14. RESET ZOOM
    if (text.includes('reset zoom') || text.includes('normal zoom') || text.includes('default zoom')) {
      return tryExecute('reset-zoom', 800, () => {
        store.setZoomFactor(1.0)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Reset Zoom')
        showActionFeedback('✓ RESET ZOOM TO 1.0x')
      })
    }

    // 15. PAUSE / STOP / HOLD
    if (
      text.includes('stop') ||
      text.includes('pause') ||
      text.includes('hold') ||
      text.includes('freeze')
    ) {
      return tryExecute('pause', 800, () => {
        if (!store.isPaused) {
          store.togglePause()
          templeAudio.playTempleBell()
          setLastVoiceCommand('Pause')
          showActionFeedback('✓ PAUSED CINEMATIC MOTION')
        }
      })
    }

    // 16. PLAY / RESUME
    if (
      text.includes('play') ||
      text.includes('resume') ||
      text.includes('continue') ||
      text.includes('start')
    ) {
      return tryExecute('resume', 800, () => {
        if (store.isPaused) {
          store.togglePause()
          templeAudio.playTempleBell()
          setLastVoiceCommand('Resume')
          showActionFeedback('✓ RESUMED CINEMATIC MOTION')
        }
      })
    }

    // 17. CHAPTER JUMPS
    if (text.includes('entrance') || text.includes('gateway') || text.includes('gopuram')) {
      return tryExecute('chap-entrance', 1200, () => {
        store.jumpToSection(0)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Entrance Gopuram')
        showActionFeedback('✓ JUMPED TO: Keralantakan Gopuram')
      })
    }

    if (text.includes('approach') || text.includes('courtyard')) {
      return tryExecute('chap-approach', 1200, () => {
        store.jumpToSection(1)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Sacred Approach')
        showActionFeedback('✓ JUMPED TO: Sacred Approach')
      })
    }

    if (text.includes('mantra') || text.includes('chant') || text.includes('tryambakam')) {
      return tryExecute('chant', 1500, () => {
        if (store.isAudioMuted) {
          store.toggleAudio()
        }
        store.jumpToSection(4)
        templeAudio.playTempleBell()
        setLastVoiceCommand('Maha Mrityunjaya Mantra')
        showActionFeedback('✓ PLAYING SACRED MANTRA AT LINGAM')
      })
    }

    if (text.includes('timeline') || text.includes('history')) {
      return tryExecute('timeline', 1200, () => {
        useExperienceStore.setState((s) => ({ isTimelineOpen: !s.isTimelineOpen }))
        templeAudio.playTempleBell()
        setLastVoiceCommand('Timeline')
        showActionFeedback('✓ TOGGLED HISTORICAL TIMELINE')
      })
    }

    if (text.includes('close') || text.includes('dismiss') || text.includes('exit')) {
      return tryExecute('dismiss', 600, () => {
        store.closePhotoModal()
        useExperienceStore.setState({ isTimelineOpen: false, showVoiceHelp: false })
        showActionFeedback('✓ DISMISSED MODALS')
      })
    }

    if (text.includes('audio') || text.includes('sound') || text.includes('music') || text.includes('mute')) {
      return tryExecute('audio', 800, () => {
        store.toggleAudio()
        setLastVoiceCommand('Audio Toggle')
        showActionFeedback('✓ TOGGLED TEMPLE AUDIO')
      })
    }

    if (text.includes('help') || text.includes('commands')) {
      return tryExecute('help', 1200, () => {
        store.setShowVoiceHelp(true)
        showActionFeedback('✓ DISPLAYING VOICE COMMANDS')
      })
    }

    // Only display hearing prompt if final utterance was not recognized
    if (isFinal) {
      setLastVoiceCommand(null)
      showActionFeedback(`Hearing: "${text}" (say "help" for commands)`)
    }
  }, [setVoiceTranscript, setLastVoiceCommand, showActionFeedback])

  // Initialize Speech Recognition with low-latency interim results
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
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        if (!isCancelled) {
          setVoiceListening(true)
          setMicPermissionDenied(false)
        }
      }

      recognition.onresult = (event: any) => {
        if (isCancelled) return
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i]
          if (res && res[0]) {
            const transcript = res[0].transcript
            processVoiceCommand(transcript, res.isFinal)
          }
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
        setVoiceListening(false)
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current)
        }
        // Auto-restart cleanly if voice is still enabled
        if (!isCancelled && useExperienceStore.getState().isVoiceEnabled) {
          restartTimeoutRef.current = window.setTimeout(() => {
            if (!isCancelled && useExperienceStore.getState().isVoiceEnabled) {
              try {
                recognition.start()
              } catch {
                // Ignore already started error
              }
            }
          }, 250)
        }
      }

      recognitionRef.current = recognition
    } catch (err) {
      console.warn('SpeechRecognition initialization failed:', err)
      setSpeechSupported(false)
    }

    return () => {
      isCancelled = true
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
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
