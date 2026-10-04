import { useExperienceStore } from '../../state/experienceStore'

export type InputSource = 'hand' | 'mouse' | 'touch' | 'keyboard'

class InputControllerManager {
  private currentProgress = 0
  private targetProgress = 0
  private orbitAngle = 0
  private targetOrbitAngle = 0
  private orbitElevation = 0
  private targetOrbitElevation = 0
  private zoomFactor = 1.0
  private targetZoomFactor = 1.0

  private lastStoreUpdate = 0
  private storeUpdateInterval = 80 // ms between UI store updates during motion
  private isAnimating = false

  constructor() {
    // Initial sync from store
    const state = useExperienceStore.getState()
    this.currentProgress = state.sceneProgress
    this.targetProgress = state.targetProgress
  }

  // Progress API
  addProgress(delta: number, source: InputSource = 'mouse') {
    const state = useExperienceStore.getState()
    if (state.isPaused || state.isLocked) return

    const reducedMotion = state.reducedMotion
    const motionMultiplier = reducedMotion ? 0.4 : 1.0

    this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + delta * motionMultiplier))
    
    if (state.inputMode !== source) {
      state.setInputMode(source)
    }

    this.syncTargetToStore()
  }

  setProgress(progress: number, source: InputSource = 'mouse') {
    this.targetProgress = Math.max(0, Math.min(1, progress))
    const state = useExperienceStore.getState()
    if (state.inputMode !== source) {
      state.setInputMode(source)
    }
    this.syncTargetToStore()
  }

  // Orbit API
  addOrbit(dAngle: number, dElev: number, source: InputSource = 'mouse') {
    const state = useExperienceStore.getState()
    if (state.isPaused || state.isLocked) return

    // Limit maximum orbit velocity
    const clampedAngleDelta = Math.max(-0.08, Math.min(0.08, dAngle))
    const clampedElevDelta = Math.max(-0.05, Math.min(0.05, dElev))

    this.targetOrbitAngle += clampedAngleDelta
    this.targetOrbitElevation = Math.max(-0.45, Math.min(0.65, this.targetOrbitElevation + clampedElevDelta))

    if (state.inputMode !== source) {
      state.setInputMode(source)
    }
    state.setOrbitDeltas(clampedAngleDelta, clampedElevDelta)
  }

  // Zoom API
  addZoom(delta: number, source: InputSource = 'mouse') {
    this.targetZoomFactor = Math.max(0.7, Math.min(3.5, this.targetZoomFactor + delta))
    const state = useExperienceStore.getState()
    if (state.inputMode !== source) {
      state.setInputMode(source)
    }
    state.setZoomFactor(this.targetZoomFactor)
  }

  // Reset orbit smoothly
  resetOrbit() {
    this.targetOrbitAngle = 0
    this.targetOrbitElevation = 0
    useExperienceStore.getState().resetOrbit()
  }

  // Per-frame smooth damping (called inside Three.js useFrame loop)
  update(deltaSeconds: number): {
    progress: number
    orbitAngle: number
    orbitElevation: number
    zoom: number
  } {
    const state = useExperienceStore.getState()
    const damping = state.reducedMotion ? 12 : 6.5

    // If store targetProgress changed externally (e.g. jumpToSection or timeline click), sync it
    if (Math.abs(state.targetProgress - this.targetProgress) > 0.0005) {
      this.targetProgress = state.targetProgress
    }

    // Damped interpolation towards targets
    const lerpFactor = Math.min(1.0, deltaSeconds * damping)
    
    this.currentProgress += (this.targetProgress - this.currentProgress) * lerpFactor
    this.orbitAngle += (this.targetOrbitAngle - this.orbitAngle) * lerpFactor
    this.orbitElevation += (this.targetOrbitElevation - this.orbitElevation) * lerpFactor
    this.zoomFactor += (this.targetZoomFactor - this.zoomFactor) * lerpFactor

    // Throttled UI state sync so React doesn't re-render 60 times/sec
    const now = performance.now()
    const isMoving = Math.abs(this.targetProgress - this.currentProgress) > 0.0005
    if (isMoving && now - this.lastStoreUpdate > this.storeUpdateInterval) {
      this.lastStoreUpdate = now
      state.setSceneProgress(this.currentProgress)
    } else if (!isMoving && this.lastStoreUpdate > 0) {
      // Final snap to exact target when movement settles
      this.lastStoreUpdate = 0
      state.setSceneProgress(this.targetProgress)
    }

    return {
      progress: this.currentProgress,
      orbitAngle: this.orbitAngle,
      orbitElevation: this.orbitElevation,
      zoom: this.zoomFactor,
    }
  }

  getCurrentProgress(): number {
    return this.currentProgress
  }

  getTargetProgress(): number {
    return this.targetProgress
  }

  getOrbit(): { angle: number; elevation: number } {
    return { angle: this.orbitAngle, elevation: this.orbitElevation }
  }

  getZoom(): number {
    return this.zoomFactor
  }

  private syncTargetToStore() {
    useExperienceStore.getState().setTargetProgress(this.targetProgress)
  }
}

export const inputController = new InputControllerManager()
