import { inputController } from './InputController'

export class MouseController {
  private isDragging = false
  private lastMouseX = 0
  private lastMouseY = 0
  private cleanupFns: (() => void)[] = []

  init(container: HTMLElement | Window = window) {
    const onWheel = (e: WheelEvent) => {
      // Normalize wheel delta across browsers and trackpads
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40
      if (e.deltaMode === 2) delta *= 800

      // Invert sign: scrolling down moves forward through the temple
      const progressDelta = (delta / 1000) * 0.065
      inputController.addProgress(progressDelta, 'mouse')
    }

    const onMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking UI interactive buttons
      if ((e.target as HTMLElement)?.closest('button, input, a, .interactive-ui')) {
        return
      }
      this.isDragging = true
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return
      const dx = e.clientX - this.lastMouseX
      const dy = e.clientY - this.lastMouseY

      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY

      // Mouse drag orbits camera
      const orbitSens = 0.0035
      inputController.addOrbit(dx * orbitSens, -dy * orbitSens, 'mouse')
    }

    const onMouseUp = () => {
      this.isDragging = false
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    this.cleanupFns.push(
      () => window.removeEventListener('wheel', onWheel),
      () => window.removeEventListener('mousedown', onMouseDown),
      () => window.removeEventListener('mousemove', onMouseMove),
      () => window.removeEventListener('mouseup', onMouseUp)
    )
  }

  destroy() {
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    this.isDragging = false
  }
}

export const mouseController = new MouseController()
