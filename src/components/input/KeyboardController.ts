import { inputController } from './InputController'
import { useExperienceStore } from '../../state/experienceStore'

export class KeyboardController {
  private cleanupFn: (() => void) | null = null

  init() {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input element
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return
      }

      const store = useExperienceStore.getState()

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault()
          inputController.addProgress(0.02, 'keyboard')
          break

        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault()
          inputController.addProgress(-0.02, 'keyboard')
          break

        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault()
          inputController.addOrbit(-0.04, 0, 'keyboard')
          break

        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault()
          inputController.addOrbit(0.04, 0, 'keyboard')
          break

        case 'Space':
          e.preventDefault()
          store.togglePause()
          break

        case 'KeyM':
          e.preventDefault()
          store.toggleAudio()
          break

        case 'KeyH':
          e.preventDefault()
          store.setHandTrackingEnabled(!store.isHandTrackingEnabled)
          break

        case 'KeyF':
          e.preventDefault()
          if (store.isFocusMode) {
            store.exitFocusMode()
          } else {
            store.activateHotspot('vimana')
          }
          break

        case 'KeyP':
          e.preventDefault()
          store.toggleDebugMode()
          break

        case 'Escape':
          e.preventDefault()
          if (store.activePhotoModal) {
            store.closePhotoModal()
          } else if (store.isFocusMode) {
            store.exitFocusMode()
          }
          break

        // Section Jump Keys 1-8
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8': {
          const sectionNum = parseInt(e.code.replace('Digit', ''), 10) - 1
          if (sectionNum >= 0 && sectionNum < 8) {
            e.preventDefault()
            store.jumpToSection(sectionNum)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    this.cleanupFn = () => window.removeEventListener('keydown', onKeyDown)
  }

  destroy() {
    if (this.cleanupFn) {
      this.cleanupFn()
      this.cleanupFn = null
    }
  }
}

export const keyboardController = new KeyboardController()
