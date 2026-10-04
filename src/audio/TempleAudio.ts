class TempleAudioSynthesizer {
  private ctx: AudioContext | null = null
  private droneGain: GainNode | null = null
  private isDronePlaying = false
  private mantraAudio: HTMLAudioElement | null = null
  private currentMantraVolume = 0
  private targetMantraVolume = 0
  private faderAnimationId: number | null = null
  private unlockListenersAttached = false
  private isDisposed = false

  init() {
    if (typeof window === 'undefined') return

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }

    if (!this.mantraAudio) {
      // Direct path to the Maha Mrityunjaya Mantra audio file
      const url = encodeURI('/Om Tryambakam Yajamahe Sugandhim Pushtivardhanam - Mantra.mp3')
      const audio = new Audio(url)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0
      this.mantraAudio = audio
    }

    if (!this.unlockListenersAttached) {
      this.attachUnlockListeners()
    }
  }

  private attachUnlockListeners() {
    this.unlockListenersAttached = true
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      if (this.mantraAudio && this.targetMantraVolume > 0 && this.mantraAudio.paused) {
        this.mantraAudio.play().catch(() => {})
      }
    }

    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock, { passive: true })
    window.addEventListener('wheel', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
  }

  /**
   * Modulates the Maha Mrityunjaya Mantra volume based on scroll proximity to the Garbhagriha Lingam.
   * Milestone 4 (Peruvudaiyar Maha Lingam) is centered at progress = 0.72.
   * Proximity range: [0.62, 0.82] with peak immersion at 0.72.
   */
  updateProgress(progress: number, isMuted: boolean) {
    this.init()

    const LINGAM_CENTER = 0.72
    const LINGAM_RADIUS = 0.10 // Active range: 0.62 to 0.82

    const distance = Math.abs(progress - LINGAM_CENTER)
    let target = 0

    if (!isMuted && distance < LINGAM_RADIUS) {
      const norm = distance / LINGAM_RADIUS // 0.0 at center, 1.0 at edge
      // Smooth raised-cosine window for serene acoustic transition into the sanctum
      const acousticCurve = 0.5 * (1 + Math.cos(Math.PI * norm))
      target = acousticCurve * 0.88 // Resonant max volume 0.88
    }

    this.targetMantraVolume = target
    this.ensureFaderLoop()
  }

  private ensureFaderLoop() {
    if (this.faderAnimationId !== null || !this.mantraAudio || this.isDisposed) return

    const tick = () => {
      if (!this.mantraAudio || this.isDisposed) {
        this.faderAnimationId = null
        return
      }

      const diff = this.targetMantraVolume - this.currentMantraVolume

      if (Math.abs(diff) > 0.003) {
        // Fast responsive fade-in (10%), gentle graceful fade-out (6%)
        const step = diff > 0 ? 0.10 : 0.06
        this.currentMantraVolume += diff * step
        this.mantraAudio.volume = Math.max(0, Math.min(1, this.currentMantraVolume))

        // Start playback if we're fading in and currently paused
        if (this.currentMantraVolume > 0.01 && this.mantraAudio.paused) {
          this.mantraAudio.play().catch(() => {})
        }

        this.adjustDroneGainForMantra()
        this.faderAnimationId = requestAnimationFrame(tick)
      } else {
        // Reached target
        this.currentMantraVolume = this.targetMantraVolume
        this.mantraAudio.volume = Math.max(0, Math.min(1, this.currentMantraVolume))

        if (this.currentMantraVolume <= 0.001) {
          if (!this.mantraAudio.paused) {
            this.mantraAudio.pause()
          }
        } else if (this.mantraAudio.paused) {
          this.mantraAudio.play().catch(() => {})
        }

        this.adjustDroneGainForMantra()
        this.faderAnimationId = null
      }
    }

    this.faderAnimationId = requestAnimationFrame(tick)
  }

  private adjustDroneGainForMantra() {
    if (!this.ctx || !this.droneGain || !this.isDronePlaying) return
    // Base drone gain is 0.08. When mantra is active, subtly duck drone by up to ~40%
    const duckFactor = 1.0 - (this.currentMantraVolume / 0.88) * 0.4
    const newDroneGain = Math.max(0.015, 0.08 * duckFactor)
    this.droneGain.gain.setTargetAtTime(newDroneGain, this.ctx.currentTime, 0.1)
  }

  getMantraVolume(): number {
    return this.currentMantraVolume
  }

  isMantraActive(): boolean {
    return this.targetMantraVolume > 0.05
  }

  startDrone() {
    this.init()
    if (!this.ctx || this.isDronePlaying) return

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }

    const now = this.ctx.currentTime

    // Master drone gain
    const masterGain = this.ctx.createGain()
    masterGain.gain.setValueAtTime(0.001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.08, now + 3)
    masterGain.connect(this.ctx.destination)
    this.droneGain = masterGain

    // Sacred fundamental frequencies (Sa - Pa harmonic drone ~ 138Hz / C#)
    const freqs = [138.59, 207.65, 277.18, 415.3]

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const filter = this.ctx.createBiquadFilter()
      const voiceGain = this.ctx.createGain()

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      // Subtle detune for rich natural chorus
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800 + idx * 200, now)

      voiceGain.gain.setValueAtTime(0.2 / (idx + 1), now)

      osc.connect(filter)
      filter.connect(voiceGain)
      voiceGain.connect(masterGain)

      osc.start(now)
    })

    this.isDronePlaying = true
  }

  stopDrone() {
    if (!this.ctx || !this.droneGain || !this.isDronePlaying) return
    const now = this.ctx.currentTime
    this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5)
    setTimeout(() => {
      this.isDronePlaying = false
    }, 1500)
  }

  playTempleBell() {
    this.init()
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }

    const now = this.ctx.currentTime
    // Bronze bell metallic partials
    const bellPartials = [
      { freq: 587.33, gain: 0.3, decay: 3.5 }, // D5
      { freq: 880.0, gain: 0.2, decay: 2.8 },  // A5
      { freq: 1174.66, gain: 0.15, decay: 2.2 }, // D6
      { freq: 1661.22, gain: 0.08, decay: 1.6 }, // G#6
    ]

    bellPartials.forEach((p) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(p.freq, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(p.gain, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + p.decay)
    })
  }

  dispose() {
    this.isDisposed = true
    if (this.faderAnimationId !== null) {
      cancelAnimationFrame(this.faderAnimationId)
      this.faderAnimationId = null
    }
    if (this.mantraAudio) {
      this.mantraAudio.pause()
      this.mantraAudio.src = ''
      this.mantraAudio = null
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
  }
}

export const templeAudio = new TempleAudioSynthesizer()
