export interface ConfigurableGestureConstants {
  gestureSensitivity: number
  deadZoneY: number
  deadZoneX: number
  smoothingFactor: number
  maxCameraVelocity: number
  pinchThreshold: number
  pinchReleaseThreshold: number
  swipeVelocityThreshold: number
  handDetectionTimeoutMs: number
}


export const GESTURE_CONFIG: ConfigurableGestureConstants = {
  gestureSensitivity: 1.5, // Tuned for silky-smooth cinematic precision (prevents rapid overshooting)
  deadZoneY: 0.0015,       // Ultra-fine threshold paired with 1-Euro adaptive filter
  deadZoneX: 0.0015,
  smoothingFactor: 0.28,
  maxCameraVelocity: 0.05,
  pinchThreshold: 0.085,
  pinchReleaseThreshold: 0.125,
  swipeVelocityThreshold: 0.55,
  handDetectionTimeoutMs: 500,
}

export interface Point3D {
  x: number
  y: number
  z: number
}

/**
 * 1-Euro Filter for scalar coordinates
 * Dynamically adjusts cutoff frequency based on movement speed:
 * - When hand is holding still: low cutoff = eliminates all sensor jitter and hand tremors
 * - When hand is moving: high cutoff = zero latency tracking
 */
export class OneEuroScalar {
  private minCutoff: number
  private beta: number
  private dCutoff: number
  private xPrev: number | null = null
  private dxPrev = 0
  private tPrev: number | null = null

  constructor(minCutoff = 1.0, beta = 0.20, dCutoff = 1.0) {
    this.minCutoff = minCutoff
    this.beta = beta
    this.dCutoff = dCutoff
  }

  filter(x: number, timestamp = performance.now()): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x
      this.tPrev = timestamp
      this.dxPrev = 0
      return x
    }

    const dt = Math.max(0.001, (timestamp - this.tPrev) / 1000)
    this.tPrev = timestamp

    const dx = (x - this.xPrev) / dt
    const aD = this.alpha(dt, this.dCutoff)
    const edx = aD * dx + (1 - aD) * this.dxPrev
    this.dxPrev = edx

    const cutoff = this.minCutoff + this.beta * Math.abs(edx)
    const a = this.alpha(dt, cutoff)
    const xFiltered = a * x + (1 - a) * this.xPrev
    this.xPrev = xFiltered
    return xFiltered
  }

  private alpha(dt: number, cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff)
    return 1.0 / (1.0 + tau / dt)
  }

  reset() {
    this.xPrev = null
    this.tPrev = null
    this.dxPrev = 0
  }
}

/**
 * Precision 1-Euro Multi-point Smoother for 21 Hand Landmarks
 */
export class LandmarkSmoother {
  private filtersX: OneEuroScalar[] = []
  private filtersY: OneEuroScalar[] = []
  private filtersZ: OneEuroScalar[] = []
  private smoothedLandmarks: Point3D[] = []

  constructor() {
    this.reset()
  }

  smooth(raw: Point3D[], now = performance.now()): Point3D[] {
    if (!raw || raw.length === 0) return []

    // Initialize filters for each landmark if needed
    while (this.filtersX.length < raw.length) {
      this.filtersX.push(new OneEuroScalar(1.0, 0.20, 1.0))
      this.filtersY.push(new OneEuroScalar(1.0, 0.20, 1.0))
      this.filtersZ.push(new OneEuroScalar(1.0, 0.20, 1.0))
    }

    this.smoothedLandmarks = raw.map((pt, i) => ({
      x: this.filtersX[i].filter(pt.x, now),
      y: this.filtersY[i].filter(pt.y, now),
      z: pt.z !== undefined ? this.filtersZ[i].filter(pt.z, now) : 0,
    }))

    return this.smoothedLandmarks
  }

  reset() {
    this.filtersX.forEach((f) => f.reset())
    this.filtersY.forEach((f) => f.reset())
    this.filtersZ.forEach((f) => f.reset())
    this.smoothedLandmarks = []
  }
}

/**
 * Hand Velocity Tracker with timestamp history
 */
export class HandVelocityTracker {
  private lastPos: Point3D | null = null
  private lastTime = 0
  private history: { pos: Point3D; time: number }[] = []

  update(pos: Point3D, now = performance.now()): { vx: number; vy: number; dt: number } {
    if (!this.lastPos) {
      this.lastPos = { ...pos }
      this.lastTime = now
      this.history = [{ pos: { ...pos }, time: now }]
      return { vx: 0, vy: 0, dt: 0 }
    }

    const dt = Math.max(1, now - this.lastTime) / 1000 // in seconds
    const dx = pos.x - this.lastPos.x
    const dy = pos.y - this.lastPos.y

    const vx = dx / dt
    const vy = dy / dt

    this.lastPos = { ...pos }
    this.lastTime = now

    // Keep 250ms history for swipe classification
    this.history.push({ pos: { ...pos }, time: now })
    const cutoff = now - 300
    this.history = this.history.filter((h) => h.time >= cutoff)

    return { vx, vy, dt }
  }

  getRecentSwipeVelocity(): { vx: number; vy: number } {
    if (this.history.length < 2) return { vx: 0, vy: 0 }
    const first = this.history[0]
    const last = this.history[this.history.length - 1]
    const dt = (last.time - first.time) / 1000
    if (dt < 0.05) return { vx: 0, vy: 0 }
    return {
      vx: (last.pos.x - first.pos.x) / dt,
      vy: (last.pos.y - first.pos.y) / dt,
    }
  }

  reset() {
    this.lastPos = null
    this.lastTime = 0
    this.history = []
  }
}

/**
 * Precision Dead-zone and Non-linear Scaling:
 * - Sub-pixel micro-tremors are softly eliminated
 * - Delicate framing movements are ultra-fine
 * - Faster sweeps naturally ramp up with smooth quadratic momentum
 */
export function applyDeadZone(value: number, threshold: number): number {
  const abs = Math.abs(value)
  if (abs < threshold) {
    return 0
  }
  const effective = abs - threshold
  const sign = Math.sign(value)
  // Precision non-linear curve:
  return sign * (effective + Math.pow(effective * 20, 1.3) * 0.05)
}
