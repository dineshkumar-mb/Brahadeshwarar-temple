import { inputController } from './InputController'

export class TouchController {
  private lastTouchX = 0
  private lastTouchY = 0
  private lastPinchDistance = 0
  private isTouching = false
  private cleanupFns: (() => void)[] = []

  init(container: HTMLElement | Window = window) {
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest('button, input, a, .interactive-ui')) {
        return
      }

      if (e.touches.length === 1) {
        this.isTouching = true
        this.lastTouchX = e.touches[0].clientX
        this.lastTouchY = e.touches[0].clientY
      } else if (e.touches.length === 2) {
        this.isTouching = true
        this.lastPinchDistance = this.getTouchDistance(e.touches[0], e.touches[1])
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!this.isTouching) return
      if ((e.target as HTMLElement)?.closest('button, input, a, .interactive-ui')) {
        return
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        const dx = touch.clientX - this.lastTouchX
        const dy = touch.clientY - this.lastTouchY

        this.lastTouchX = touch.clientX
        this.lastTouchY = touch.clientY

        // Primary vertical drag moves cinematic progress
        const progressDelta = -dy * 0.0016
        inputController.addProgress(progressDelta, 'touch')

        // Horizontal drag gently orbits camera
        const orbitDelta = dx * 0.003
        inputController.addOrbit(orbitDelta, 0, 'touch')

        // Prevent pull-to-refresh
        if (e.cancelable) e.preventDefault()
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const currentDist = this.getTouchDistance(e.touches[0], e.touches[1])
        if (this.lastPinchDistance > 0) {
          const delta = (currentDist - this.lastPinchDistance) * 0.005
          inputController.addZoom(delta, 'touch')
        }
        this.lastPinchDistance = currentDist
        if (e.cancelable) e.preventDefault()
      }
    }

    const onTouchEnd = () => {
      this.isTouching = false
      this.lastPinchDistance = 0
    }

    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    this.cleanupFns.push(
      () => window.removeEventListener('touchstart', onTouchStart),
      () => window.removeEventListener('touchmove', onTouchMove),
      () => window.removeEventListener('touchend', onTouchEnd),
      () => window.removeEventListener('touchcancel', onTouchEnd)
    )
  }

  private getTouchDistance(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  destroy() {
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    this.isTouching = false
  }
}

export const touchController = new TouchController()
