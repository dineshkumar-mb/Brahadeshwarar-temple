import React, { useEffect, useRef } from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { inputController } from '../input/InputController'
import { Bug, X } from 'lucide-react'

// MediaPipe standard hand connections
const HAND_CONNECTIONS = [
  // Palm base
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm bottom closure
]

export const DebugOverlay: React.FC = () => {
  const isDebugMode = useExperienceStore((s) => s.isDebugMode)
  const toggleDebugMode = useExperienceStore((s) => s.toggleDebugMode)

  const isEnabled = useExperienceStore((s) => s.isHandTrackingEnabled)
  const isDetected = useExperienceStore((s) => s.isHandDetected)
  const gesture = useExperienceStore((s) => s.detectedGesture)
  const confidence = useExperienceStore((s) => s.gestureConfidence)
  const fps = useExperienceStore((s) => s.trackingFps)
  const pinchDist = useExperienceStore((s) => s.pinchDistance)
  const handPos = useExperienceStore((s) => s.handPosition)
  const velocity = useExperienceStore((s) => s.handVelocity)
  const rawLandmarks = useExperienceStore((s) => s.rawLandmarks)
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)
  const targetProgress = useExperienceStore((s) => s.targetProgress)
  const isLocked = useExperienceStore((s) => s.isLocked)
  const isPaused = useExperienceStore((s) => s.isPaused)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Draw 21 landmarks on canvas
  useEffect(() => {
    if (!isDebugMode || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (rawLandmarks && rawLandmarks.length >= 21) {
      const w = canvas.width
      const h = canvas.height

      // Draw skeleton lines
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)'

      HAND_CONNECTIONS.forEach(([i1, i2]) => {
        const p1 = rawLandmarks[i1]
        const p2 = rawLandmarks[i2]
        if (p1 && p2) {
          ctx.beginPath()
          ctx.moveTo((1 - p1.x) * w, p1.y * h)
          ctx.lineTo((1 - p2.x) * w, p2.y * h)
          ctx.stroke()
        }
      })

      // Draw landmark points (mirrored for natural selfie view)
      rawLandmarks.forEach((pt, idx) => {
        const isTip = [4, 8, 12, 16, 20].includes(idx)
        ctx.beginPath()
        ctx.arc((1 - pt.x) * w, pt.y * h, isTip ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = isTip ? '#f59e0b' : '#38bdf8'
        ctx.fill()
      })
    } else {
      // Placeholder if no hand
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(
        isEnabled ? 'Searching for hand...' : 'Hand tracking disabled',
        canvas.width / 2,
        canvas.height / 2
      )
    }
  }, [isDebugMode, rawLandmarks, isEnabled])

  if (!isDebugMode) return null

  const orbit = inputController.getOrbit()
  const zoom = inputController.getZoom()

  return (
    <aside
      aria-label="Developer Telemetry Debug HUD"
      className="fixed bottom-24 left-6 z-50 w-72 bg-stone-950/90 border border-emerald-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-xs text-stone-300"
    >
      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Bug className="w-4 h-4" />
          <span>DEVELOPER DEBUG HUD</span>
        </div>
        <button
          type="button"
          onClick={toggleDebugMode}
          className="text-stone-500 hover:text-stone-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2D Landmark Canvas Preview */}
      <div className="mb-3 border border-stone-800 rounded bg-black/60 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={250}
          height={170}
          className="w-full h-auto block"
        />
        <div className="absolute top-1 left-2 text-[9px] text-stone-500">
          21-POINT SKELETON
        </div>
      </div>

      {/* Real-time Telemetry Data Grid */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-stone-500">Tracking FPS:</span>
          <span className="text-emerald-300 font-bold">{fps} fps</span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Hand Detected:</span>
          <span className={isDetected ? 'text-emerald-400' : 'text-stone-500'}>
            {isDetected ? 'TRUE' : 'FALSE'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Detected Gesture:</span>
          <span className="text-amber-400 font-bold">{gesture}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Confidence:</span>
          <span>{(confidence * 100).toFixed(0)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Hand X / Y:</span>
          <span>
            {handPos.x.toFixed(3)}, {handPos.y.toFixed(3)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Velocity (vx, vy):</span>
          <span>
            {velocity.vx.toFixed(2)}, {velocity.vy.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-500">Pinch Distance:</span>
          <span className={pinchDist < 0.085 ? 'text-sky-400 font-bold' : ''}>
            {pinchDist.toFixed(3)}
          </span>
        </div>

        <div className="border-t border-stone-800/80 my-1 pt-1">
          <div className="flex justify-between">
            <span className="text-stone-500">Scene Progress:</span>
            <span className="text-amber-300">
              {(sceneProgress * 100).toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Target Progress:</span>
            <span>{(targetProgress * 100).toFixed(2)}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Orbit Angle:</span>
            <span>{(orbit.angle * (180 / Math.PI)).toFixed(1)}°</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Zoom Factor:</span>
            <span>{zoom.toFixed(2)}x</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">State:</span>
            <span className="text-stone-400">
              {isLocked ? 'LOCKED' : isPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
