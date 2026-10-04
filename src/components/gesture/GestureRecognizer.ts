import { GestureType, LandmarkPoint } from '../../state/experienceStore'
import {
  GESTURE_CONFIG,
  HandVelocityTracker,
  Point3D,
  applyDeadZone,
} from './GestureSmoothing'

export interface GestureRecognitionResult {
  gesture: GestureType
  confidence: number
  pinchDistance: number
  isPinching: boolean
  isOpenPalm: boolean
  isFist: boolean
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
  handCenter: Point3D
}

export class GestureRecognizer {
  private velocityTracker = new HandVelocityTracker()
  private previousCenter: Point3D | null = null
  private wasPinching = false
  private swipeCooldownUntil = 0
  private lastDirection: 'X' | 'Y' | 'NONE' = 'NONE'

  reset() {
    this.velocityTracker.reset()
    this.previousCenter = null
    this.wasPinching = false
    this.swipeCooldownUntil = 0
    this.lastDirection = 'NONE'
  }

  recognize(landmarks: LandmarkPoint[], now = performance.now()): GestureRecognitionResult {
    if (!landmarks || landmarks.length < 21) {
      this.reset()
      return {
        gesture: 'NONE',
        confidence: 0,
        pinchDistance: 1,
        isPinching: false,
        isOpenPalm: false,
        isFist: false,
        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        handCenter: { x: 0.5, y: 0.5, z: 0 },
      }
    }

    // 1. Calculate Hand Center (midpoint between Wrist and Middle MCP)
    // Mirror X coordinate so hand tracking naturally matches the user's mirror view:
    // moving hand right -> X increases, moving hand left -> X decreases.
    const wrist = landmarks[0]
    const middleMcp = landmarks[9]
    const rawCenterX = (wrist.x + middleMcp.x) * 0.5
    const handCenter: Point3D = {
      x: 1.0 - rawCenterX,
      y: (wrist.y + middleMcp.y) * 0.5,
      z: (wrist.z + middleMcp.z) * 0.5,
    }

    // 2. Hand Scale (reference distance for invariant thresholding)
    const handScale = Math.max(0.04, this.dist(wrist, middleMcp))

    // 3. Pinch Detection: Thumb tip (4) to Index tip (8)
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const rawPinchDist = this.dist(thumbTip, indexTip)
    const normalizedPinchDist = rawPinchDist / handScale

    // Hysteresis on pinch to avoid chatter
    let isPinching = false
    if (this.wasPinching) {
      isPinching = normalizedPinchDist < GESTURE_CONFIG.pinchReleaseThreshold
    } else {
      isPinching = normalizedPinchDist < GESTURE_CONFIG.pinchThreshold
    }
    this.wasPinching = isPinching

    // 4. Finger extension status
    const fingersExtended = this.checkFingersExtended(landmarks, wrist)
    const extendedCount = fingersExtended.filter(Boolean).length

    const isOpenPalm = extendedCount >= 4 && !isPinching
    const isFist = extendedCount === 0 && !isPinching

    // 5. Velocity and displacement
    const { vx, vy } = this.velocityTracker.update(handCenter, now)
    let deltaX = 0
    let deltaY = 0

    if (this.previousCenter) {
      // Natural mirrored coordinates: moving hand to user's right produces positive deltaX
      deltaX = handCenter.x - this.previousCenter.x
      // In video coords: moving hand UP means Y decreases (deltaY < 0).
      // We invert deltaY so positive = user moved hand upward.
      deltaY = -(handCenter.y - this.previousCenter.y)
    }
    this.previousCenter = { ...handCenter }

    // Apply deadzone filtering
    const filteredDeltaX = applyDeadZone(deltaX, GESTURE_CONFIG.deadZoneX)
    const filteredDeltaY = applyDeadZone(deltaY, GESTURE_CONFIG.deadZoneY)

    // 6. Rapid Swipe check (with cooldown)
    let gesture: GestureType = 'NONE'
    let confidence = 0.85

    if (now > this.swipeCooldownUntil) {
      const swipeVel = this.velocityTracker.getRecentSwipeVelocity()
      if (Math.abs(swipeVel.vx) > GESTURE_CONFIG.swipeVelocityThreshold) {
        if (swipeVel.vx > 0) {
          gesture = 'SWIPE_RIGHT'
          this.swipeCooldownUntil = now + 650
        } else {
          gesture = 'SWIPE_LEFT'
          this.swipeCooldownUntil = now + 650
        }
      }
    }

    if (gesture === 'NONE') {
      // 7. Pinch Priority: Pinch Zoom vs Static Pinch Focus
      if (isPinching) {
        if (filteredDeltaY > 0.003) {
          gesture = 'PINCH_ZOOM_IN'
          confidence = 0.94
        } else if (filteredDeltaY < -0.003) {
          gesture = 'PINCH_ZOOM_OUT'
          confidence = 0.94
        } else {
          gesture = 'PINCH'
          confidence = 0.92
        }
      } else if (isFist) {
        // 8. Closed fist: Lock interaction
        gesture = 'CLOSED_FIST'
        confidence = 0.95
      } else {
        // 9. Active Directional Motion with Axis Hysteresis
        const absX = Math.abs(filteredDeltaX)
        const absY = Math.abs(filteredDeltaY)

        // Hand is in active motion if either delta exceeds deadzone
        if (absX > 0 || absY > 0) {
          // Hysteresis bias: favor currently active axis to prevent jittery diagonal switching
          const yBias = this.lastDirection === 'Y' ? 1.25 : 1.0
          const xBias = this.lastDirection === 'X' ? 1.25 : 1.0

          if (absY * yBias >= absX * xBias) {
            this.lastDirection = 'Y'
            gesture = filteredDeltaY > 0 ? 'MOVE_UP' : 'MOVE_DOWN'
            confidence = Math.min(1.0, 0.75 + absY * 30)
          } else {
            this.lastDirection = 'X'
            gesture = filteredDeltaX > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT'
            confidence = Math.min(1.0, 0.75 + absX * 30)
          }
        } else {
          this.lastDirection = 'NONE'
          // Hand is stationary / holding steady:
          if (isOpenPalm) {
            gesture = 'OPEN_PALM'
            confidence = 0.90
          }
        }
      }
    }

    return {
      gesture,
      confidence,
      pinchDistance: normalizedPinchDist,
      isPinching,
      isOpenPalm,
      isFist,
      deltaX: filteredDeltaX,
      deltaY: filteredDeltaY,
      velocityX: vx,
      velocityY: vy,
      handCenter,
    }
  }

  private dist(p1: LandmarkPoint, p2: LandmarkPoint): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const dz = (p1.z || 0) - (p2.z || 0)
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  private checkFingersExtended(landmarks: LandmarkPoint[], wrist: LandmarkPoint): boolean[] {
    // Check index, middle, ring, pinky tips vs their PIP joints relative to wrist
    // Index: 8 (tip), 6 (pip)
    // Middle: 12 (tip), 10 (pip)
    // Ring: 16 (tip), 14 (pip)
    // Pinky: 20 (tip), 18 (pip)
    const fingerIndices = [
      { tip: 8, pip: 6 },
      { tip: 12, pip: 10 },
      { tip: 16, pip: 14 },
      { tip: 20, pip: 18 },
    ]

    return fingerIndices.map(({ tip, pip }) => {
      const tipDist = this.dist(landmarks[tip], wrist)
      const pipDist = this.dist(landmarks[pip], wrist)
      return tipDist > pipDist * 1.15
    })
  }
}
