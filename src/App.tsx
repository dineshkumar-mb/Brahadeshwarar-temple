import React, { useEffect } from 'react'
import { TempleScene } from './components/temple/TempleScene'
import { GestureController } from './components/gesture/GestureController'
import { HandTracker } from './components/gesture/HandTracker'
import { HeritageInfo } from './components/ui/HeritageInfo'
import { HotspotDetailPanel } from './components/ui/HotspotDetailPanel'
import { PhotoModal } from './components/ui/PhotoModal'
import { TempleTimelineModal } from './components/ui/TempleTimelineModal'
import { CinematicProgress } from './components/ui/CinematicProgress'
import { GesturePermission } from './components/ui/GesturePermission'
import { DebugOverlay } from './components/ui/DebugOverlay'
import { WebGLFallback } from './components/ui/WebGLFallback'
import { VoiceController } from './components/voice/VoiceController'
import { VoiceHelpModal } from './components/ui/VoiceHelpModal'
import { SkyEffectsOverlay } from './components/ui/SkyEffectsOverlay'
import { mouseController } from './components/input/MouseController'
import { touchController } from './components/input/TouchController'
import { keyboardController } from './components/input/KeyboardController'
import { templeAudio } from './audio/TempleAudio'
import { useExperienceStore } from './state/experienceStore'

export const App: React.FC = () => {
  const isAudioMuted = useExperienceStore((s) => s.isAudioMuted)
  const currentSection = useExperienceStore((s) => s.currentSection)
  const setReducedMotion = useExperienceStore((s) => s.setReducedMotion)
  const webglFailed = useExperienceStore((s) => s.webglFailed)

  // Initialize input listeners and motion preference
  useEffect(() => {
    mouseController.init()
    touchController.init()
    keyboardController.init()

    // Detect OS/browser reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setReducedMotion(true)
    }
    const onMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', onMotionChange)

    return () => {
      mouseController.destroy()
      touchController.destroy()
      keyboardController.destroy()
      mediaQuery.removeEventListener('change', onMotionChange)
    }
  }, [setReducedMotion])

  // Handle ambient drone and sanctum mantra audio proximity
  useEffect(() => {
    templeAudio.init()

    if (!isAudioMuted) {
      templeAudio.startDrone()
    } else {
      templeAudio.stopDrone()
    }

    // Initial progress update
    const initial = useExperienceStore.getState()
    templeAudio.updateProgress(initial.sceneProgress, initial.isAudioMuted)

    // Low-latency subscription to camera progress without React re-render overhead
    const unsubscribe = useExperienceStore.subscribe((state) => {
      templeAudio.updateProgress(state.sceneProgress, state.isAudioMuted)

      const isNearLingam = Math.abs(state.sceneProgress - 0.72) < 0.10
      const active = isNearLingam && !state.isAudioMuted
      if (state.isMantraActive !== active) {
        state.setIsMantraActive(active)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [isAudioMuted])

  // Play subtle sacred bell tone on section milestone transition
  useEffect(() => {
    if (!isAudioMuted && currentSection > 0) {
      templeAudio.playTempleBell()
    }
  }, [currentSection, isAudioMuted])

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#060504] select-none">
      {/* 3D WebGL Canvas or Graceful Fallback */}
      {webglFailed ? <WebGLFallback /> : <TempleScene />}

      {/* CSS atmospheric sky overlay — sunshine god-rays or moonshine glow */}
      <SkyEffectsOverlay />

      {/* MediaPipe Gesture Recognition Engine */}
      <GestureController />

      {/* Floating subtle hand tracking UI & reticle */}
      <HandTracker />

      {/* Cinematic section storytelling overlays */}
      <HeritageInfo />

      {/* Hotspot detail card when focus mode is active */}
      <HotspotDetailPanel />

      {/* Archaeological high-res photo modal */}
      <PhotoModal />

      {/* Historical Chronology Modal */}
      <TempleTimelineModal />

      {/* Bottom Cinematic Progress & Toolbar Navigation */}
      <CinematicProgress />

      {/* First-visit minimal permission prompt */}
      <GesturePermission />

      {/* Developer-only Telemetry & Landmark HUD */}
      <DebugOverlay />

      {/* Voice Recognition Engine & Listening HUD */}
      <VoiceController />

      {/* Voice Commands Interactive Cheatsheet Modal */}
      <VoiceHelpModal />
    </div>
  )
}
export default App
