import { create } from 'zustand'

export type GestureType =
  | 'NONE'
  | 'MOVE_UP'
  | 'MOVE_DOWN'
  | 'MOVE_LEFT'
  | 'MOVE_RIGHT'
  | 'PINCH'
  | 'PINCH_ZOOM_IN'
  | 'PINCH_ZOOM_OUT'
  | 'OPEN_PALM'
  | 'CLOSED_FIST'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'

export interface HotspotItem {
  id: string
  title: string
  tamilTitle: string
  category: string
  shortDesc: string
  historicalContext: string
  position: [number, number, number]
  cameraTarget: [number, number, number]
  cameraPos: [number, number, number]
  imageRef: string
  galleryImages?: string[]
}

export interface PhotoModalData {
  title: string
  tamilTitle?: string
  imageSrc: string
  caption: string
  details: string
  galleryImages?: string[]
}

export interface LandmarkPoint {
  x: number
  y: number
  z: number
}

interface ExperienceState {
  // Cinematic progress
  sceneProgress: number
  targetProgress: number
  currentSection: number
  isPaused: boolean
  isLocked: boolean
  
  // Hand tracking state
  isHandTrackingEnabled: boolean
  isHandTrackingLoading: boolean
  isHandDetected: boolean
  isHandPreviewVisible: boolean
  handPosition: { x: number; y: number; z: number }
  rawLandmarks: LandmarkPoint[] | null
  detectedGesture: GestureType
  gestureConfidence: number
  trackingFps: number
  pinchDistance: number
  handVelocity: { vx: number; vy: number }
  
  // Camera & Orbit controls
  orbitAngle: number
  targetOrbitAngle: number
  orbitElevation: number
  targetOrbitElevation: number
  zoomFactor: number
  targetZoomFactor: number
  
  // Focus & Hotspots
  isFocusMode: boolean
  activeHotspotId: string | null
  
  // Photo modal & timeline
  activePhotoModal: PhotoModalData | null
  isTimelineOpen: boolean
  
  // Voice control state
  isVoiceEnabled: boolean
  isVoiceListening: boolean
  lastVoiceCommand: string | null
  voiceTranscript: string
  showVoiceHelp: boolean

  // System & Environment
  inputMode: 'hand' | 'mouse' | 'touch' | 'keyboard'
  permissionDenied: boolean
  showPermissionModal: boolean
  reducedMotion: boolean
  isDebugMode: boolean
  isAudioMuted: boolean
  isMantraActive: boolean
  timeOfDay: 'day' | 'night'
  modelPath: string
  webglFailed: boolean

  // 3D Model Telemetry & Bounds
  modelBounds: {
    centerX: number
    centerY: number
    centerZ: number
    sizeX: number
    sizeY: number
    sizeZ: number
    radius: number
    isLoaded: boolean
  }
  modelLoadError: string | null
  customModelUrl: string | null
  
  // Actions
  setSceneProgress: (progress: number) => void
  setTargetProgress: (progress: number | ((prev: number) => number)) => void
  addProgressDelta: (delta: number) => void
  jumpToSection: (sectionIndex: number) => void
  
  setHandTrackingEnabled: (enabled: boolean) => void
  setHandTrackingLoading: (loading: boolean) => void
  setHandDetected: (detected: boolean) => void
  toggleHandPreview: () => void
  setHandPreviewVisible: (visible: boolean) => void
  setHandData: (data: {
    position: { x: number; y: number; z: number }
    landmarks?: LandmarkPoint[]
    gesture: GestureType
    confidence: number
    fps: number
    pinchDistance: number
    velocity: { vx: number; vy: number }
  }) => void
  
  setOrbitDeltas: (dAngle: number, dElev: number) => void
  resetOrbit: () => void
  setZoomFactor: (zoom: number | ((prev: number) => number)) => void
  
  togglePause: () => void
  setIsLocked: (locked: boolean) => void
  
  activateHotspot: (hotspotId: string | null) => void
  exitFocusMode: () => void
  
  openPhotoModal: (data: PhotoModalData) => void
  closePhotoModal: () => void
  
  setInputMode: (mode: 'hand' | 'mouse' | 'touch' | 'keyboard') => void
  setPermissionDenied: (denied: boolean) => void
  setShowPermissionModal: (show: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  toggleDebugMode: () => void
  toggleAudio: () => void
  setIsMantraActive: (active: boolean) => void
  toggleTimeOfDay: () => void
  setWebglFailed: (failed: boolean) => void
  setModelPath: (path: string) => void
  setModelBounds: (bounds: {
    centerX: number
    centerY: number
    centerZ: number
    sizeX: number
    sizeY: number
    sizeZ: number
    radius: number
    isLoaded: boolean
  }) => void
  setModelLoadError: (error: string | null) => void
  setCustomModelUrl: (url: string | null) => void
  setVoiceEnabled: (enabled: boolean) => void
  setVoiceListening: (listening: boolean) => void
  setLastVoiceCommand: (cmd: string | null) => void
  setVoiceTranscript: (transcript: string) => void
  setShowVoiceHelp: (show: boolean) => void
}

export const SECTION_MILESTONES = [
  { id: 'intro', label: 'Darkness / Inception', progress: 0.0, range: [0.0, 0.12] },
  { id: 'approach', label: 'Sacred Approach', progress: 0.15, range: [0.12, 0.32] },
  { id: 'vimana', label: 'Celestial Vimana', progress: 0.35, range: [0.32, 0.52] },
  { id: 'rotation', label: 'Architecture in the Round', progress: 0.55, range: [0.52, 0.70] },
  { id: 'sanctum', label: 'Garbhagriha Sanctum', progress: 0.72, range: [0.70, 0.84] },
  { id: 'sculpture', label: 'Granite Monoliths', progress: 0.85, range: [0.84, 0.92] },
  { id: 'timeline', label: 'Historical Timeline', progress: 0.93, range: [0.92, 0.97] },
  { id: 'heritage', label: 'Living Heritage Finale', progress: 0.98, range: [0.97, 1.0] },
]

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  sceneProgress: 0,
  targetProgress: 0,
  currentSection: 0,
  isPaused: false,
  isLocked: false,

  isHandTrackingEnabled: false,
  isHandTrackingLoading: false,
  isHandDetected: false,
  isHandPreviewVisible: true,
  handPosition: { x: 0.5, y: 0.5, z: 0 },
  rawLandmarks: null,
  detectedGesture: 'NONE',
  gestureConfidence: 0,
  trackingFps: 0,
  pinchDistance: 1,
  handVelocity: { vx: 0, vy: 0 },

  orbitAngle: 0,
  targetOrbitAngle: 0,
  orbitElevation: 0,
  targetOrbitElevation: 0,
  zoomFactor: 1,
  targetZoomFactor: 1,

  isFocusMode: false,
  activeHotspotId: null,

  activePhotoModal: null,
  isTimelineOpen: false,

  inputMode: 'mouse',
  isVoiceEnabled: false,
  isVoiceListening: false,
  lastVoiceCommand: null,
  voiceTranscript: '',
  showVoiceHelp: false,
  permissionDenied: false,
  showPermissionModal: true,
  reducedMotion: false,
  isDebugMode: false,
  isAudioMuted: false,
  isMantraActive: false,
  timeOfDay: 'day' as 'day' | 'night',
  modelPath: '/models/brihadisvara-temple.glb',
  webglFailed: false,
  modelBounds: {
    centerX: 0,
    centerY: 8.5,
    centerZ: -6,
    sizeX: 24,
    sizeY: 22,
    sizeZ: 50,
    radius: 30,
    isLoaded: false,
  },
  modelLoadError: null,
  customModelUrl: null,

  setSceneProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress))
    let secIdx = 0
    for (let i = 0; i < SECTION_MILESTONES.length; i++) {
      if (clamped >= SECTION_MILESTONES[i].range[0] && clamped <= SECTION_MILESTONES[i].range[1]) {
        secIdx = i
        break
      }
    }
    set({ sceneProgress: clamped, currentSection: secIdx })
  },

  setTargetProgress: (updater) => {
    const prev = get().targetProgress
    const next = typeof updater === 'function' ? updater(prev) : updater
    const clamped = Math.max(0, Math.min(1, next))
    set({ targetProgress: clamped })
  },

  addProgressDelta: (delta) => {
    if (get().isPaused || get().isLocked) return
    const prev = get().targetProgress
    const clamped = Math.max(0, Math.min(1, prev + delta))
    set({ targetProgress: clamped })
  },

  jumpToSection: (sectionIndex) => {
    const milestone = SECTION_MILESTONES[sectionIndex]
    if (milestone) {
      set({
        targetProgress: milestone.progress,
        currentSection: sectionIndex,
        isFocusMode: false,
        activeHotspotId: null,
      })
    }
  },

  setHandTrackingEnabled: (enabled) =>
    set({
      isHandTrackingEnabled: enabled,
      ...(enabled ? { isPaused: false, isLocked: false } : {}),
    }),
  setHandTrackingLoading: (loading) => set({ isHandTrackingLoading: loading }),
  setHandDetected: (detected) => set({ isHandDetected: detected }),
  toggleHandPreview: () => set((state) => ({ isHandPreviewVisible: !state.isHandPreviewVisible })),
  setHandPreviewVisible: (visible) => set({ isHandPreviewVisible: visible }),

  setHandData: (data) =>
    set({
      handPosition: data.position,
      rawLandmarks: data.landmarks || get().rawLandmarks,
      detectedGesture: data.gesture,
      gestureConfidence: data.confidence,
      trackingFps: data.fps,
      pinchDistance: data.pinchDistance,
      handVelocity: data.velocity,
      isHandDetected: true,
    }),

  setOrbitDeltas: (dAngle, dElev) => {
    const current = get()
    // Clamp maximum rotation velocity and angles
    const newAngle = current.targetOrbitAngle + dAngle
    const newElev = Math.max(-0.4, Math.min(0.6, current.targetOrbitElevation + dElev))
    set({
      targetOrbitAngle: newAngle,
      targetOrbitElevation: newElev,
    })
  },

  resetOrbit: () => set({ targetOrbitAngle: 0, targetOrbitElevation: 0 }),

  setZoomFactor: (updater) => {
    const prev = get().targetZoomFactor
    const next = typeof updater === 'function' ? updater(prev) : updater
    const clamped = Math.max(0.7, Math.min(3.5, next))
    set({ targetZoomFactor: clamped })
  },

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setIsLocked: (locked) => set({ isLocked: locked }),

  activateHotspot: (hotspotId) =>
    set({
      activeHotspotId: hotspotId,
      isFocusMode: !!hotspotId,
    }),

  exitFocusMode: () =>
    set({
      activeHotspotId: null,
      isFocusMode: false,
      targetZoomFactor: 1,
    }),

  openPhotoModal: (data) => set({ activePhotoModal: data }),
  closePhotoModal: () => set({ activePhotoModal: null }),

  setInputMode: (mode) => set({ inputMode: mode }),
  setPermissionDenied: (denied) => set({ permissionDenied: denied }),
  setShowPermissionModal: (show) => set({ showPermissionModal: show }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),
  setIsMantraActive: (active) => set({ isMantraActive: active }),
  toggleTimeOfDay: () => set((state) => ({ timeOfDay: state.timeOfDay === 'day' ? 'night' : 'day' })),
  setWebglFailed: (failed) => set({ webglFailed: failed }),
  setModelPath: (path) => set({ modelPath: path }),
  setModelBounds: (bounds) => set({ modelBounds: bounds }),
  setModelLoadError: (error) => set({ modelLoadError: error }),
  setCustomModelUrl: (url) => set({ customModelUrl: url }),
  setVoiceEnabled: (enabled) => set({ isVoiceEnabled: enabled }),
  setVoiceListening: (listening) => set({ isVoiceListening: listening }),
  setLastVoiceCommand: (cmd) => set({ lastVoiceCommand: cmd }),
  setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),
  setShowVoiceHelp: (show) => set({ showVoiceHelp: show }),
}))
