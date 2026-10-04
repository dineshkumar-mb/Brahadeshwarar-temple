import React, { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { useExperienceStore, GestureType, LandmarkPoint } from '../../state/experienceStore'
import { GESTURE_CONFIG, LandmarkSmoother, Point3D } from './GestureSmoothing'
import { GestureRecognizer } from './GestureRecognizer'
import { inputController } from '../input/InputController'
import {
  Hand,
  Camera,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Standard MediaPipe hand skeletal joint pairs
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17],
]

export const GestureController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const isEnabled = useExperienceStore((s) => s.isHandTrackingEnabled)
  const isDetected = useExperienceStore((s) => s.isHandDetected)
  const isLoading = useExperienceStore((s) => s.isHandTrackingLoading)
  const isPreviewVisible = useExperienceStore((s) => s.isHandPreviewVisible)
  const toggleHandPreview = useExperienceStore((s) => s.toggleHandPreview)
  const [, setInitError] = useState<string | null>(null)

  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother())
  const recognizerRef = useRef<GestureRecognizer>(new GestureRecognizer())

  const streamRef = useRef<MediaStream | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const lastVideoTimeRef = useRef<number>(-1)

  // Telemetry throttling
  const lastStateSyncRef = useRef<number>(0)
  const lastGestureRef = useRef<GestureType>('NONE')
  const lastDetectionTimeRef = useRef<number>(0)

  // FPS calculation
  const frameCountRef = useRef<number>(0)
  const lastFpsTimeRef = useRef<number>(performance.now())
  const currentFpsRef = useRef<number>(0)

  useEffect(() => {
    if (!isEnabled) {
      cleanup()
      useExperienceStore.getState().setHandDetected(false)
      return
    }

    let isCancelled = false

    const setupLandmarker = async () => {
      try {
        useExperienceStore.getState().setHandTrackingLoading(true)
        setInitError(null)

        // 1. Fileset resolver - Try local wasm first with CDN fallback
        let vision: any = null
        try {
          vision = await FilesetResolver.forVisionTasks('/wasm')
        } catch {
          vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
          )
        }

        if (isCancelled) return

        // 2. Create HandLandmarker instance
        let modelAssetPath = '/models/hand_landmarker.task'
        try {
          const res = await fetch(modelAssetPath, { method: 'HEAD' })
          if (!res.ok) {
            modelAssetPath =
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
          }
        } catch {
          modelAssetPath =
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
        }

        // Try GPU delegate first, fallback to CPU delegate
        let handLandmarker: HandLandmarker | null = null
        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          })
        } catch (gpuErr) {
          console.warn('GPU delegate unavailable, falling back to CPU delegate:', gpuErr)
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          })
        }

        if (isCancelled) {
          handLandmarker.close()
          return
        }

        landmarkerRef.current = handLandmarker

        // 3. Request webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 },
          },
          audio: false,
        })

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})

          const onReady = () => {
            if (!isCancelled) {
              useExperienceStore.getState().setHandTrackingLoading(false)
              useExperienceStore.getState().setInputMode('hand')
              startLoop()
            }
          }

          if (videoRef.current.readyState >= 2) {
            onReady()
          } else {
            videoRef.current.onloadeddata = onReady
          }
        }
      } catch (err: any) {
        console.warn('Webcam or MediaPipe initialization failed:', err)
        if (!isCancelled) {
          useExperienceStore.getState().setHandTrackingLoading(false)
          useExperienceStore.getState().setHandTrackingEnabled(false)
          useExperienceStore.getState().setPermissionDenied(true)
          setInitError(err.message || 'Unable to access camera')
        }
      }
    }

    setupLandmarker()

    return () => {
      isCancelled = true
      cleanup()
    }
  }, [isEnabled])

  const drawHandOverlay = (points: Point3D[], currentGesture: GestureType) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    if (!points || points.length < 21) return

    // Pick glowing color palette matching gesture
    let strokeColor = 'rgba(245, 158, 11, 0.85)' // Amber
    let glowColor = 'rgba(245, 158, 11, 0.5)'
    let tipColor = '#38bdf8' // Sky blue

    if (currentGesture === 'MOVE_UP' || currentGesture === 'MOVE_DOWN') {
      strokeColor = 'rgba(251, 191, 36, 0.95)'
      glowColor = 'rgba(251, 191, 36, 0.6)'
      tipColor = '#fef08a'
    } else if (currentGesture === 'MOVE_LEFT' || currentGesture === 'MOVE_RIGHT') {
      strokeColor = 'rgba(52, 211, 153, 0.95)'
      glowColor = 'rgba(52, 211, 153, 0.6)'
      tipColor = '#6ee7b7'
    } else if (currentGesture.startsWith('PINCH')) {
      strokeColor = 'rgba(56, 189, 248, 0.95)'
      glowColor = 'rgba(56, 189, 248, 0.6)'
      tipColor = '#bae6fd'
    } else if (currentGesture === 'CLOSED_FIST') {
      strokeColor = 'rgba(248, 113, 113, 0.95)'
      glowColor = 'rgba(248, 113, 113, 0.6)'
      tipColor = '#fca5a5'
    }

    // 1. Draw connection bones
    ctx.save()
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = strokeColor
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 8

    HAND_CONNECTIONS.forEach(([i1, i2]) => {
      const p1 = points[i1]
      const p2 = points[i2]
      if (p1 && p2) {
        ctx.beginPath()
        ctx.moveTo(p1.x * w, p1.y * h)
        ctx.lineTo(p2.x * w, p2.y * h)
        ctx.stroke()
      }
    })
    ctx.restore()

    // 2. Draw joints & fingertip lights
    ctx.save()
    points.forEach((pt, idx) => {
      const isTip = [4, 8, 12, 16, 20].includes(idx)
      const isWrist = idx === 0
      ctx.beginPath()
      const radius = isTip ? 4.5 : isWrist ? 3.5 : 2.5
      ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2)
      ctx.fillStyle = isTip ? tipColor : '#fbbf24'
      ctx.shadowColor = isTip ? tipColor : '#f59e0b'
      ctx.shadowBlur = isTip ? 10 : 4
      ctx.fill()
    })
    ctx.restore()

    // 3. Special visual aid for Pinch (line connecting thumb and index)
    if (currentGesture.startsWith('PINCH') && points[4] && points[8]) {
      ctx.save()
      ctx.lineWidth = 3
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = '#38bdf8'
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.moveTo(points[4].x * w, points[4].y * h)
      ctx.lineTo(points[8].x * w, points[8].y * h)
      ctx.stroke()
      ctx.restore()
    }
  }

  const startLoop = () => {
    const processFrame = () => {
      const video = videoRef.current
      const landmarker = landmarkerRef.current

      if (video && landmarker && video.readyState >= 2) {
        const now = performance.now()

        // Calculate FPS
        frameCountRef.current++
        if (now - lastFpsTimeRef.current >= 1000) {
          currentFpsRef.current = Math.round(
            (frameCountRef.current * 1000) / (now - lastFpsTimeRef.current)
          )
          frameCountRef.current = 0
          lastFpsTimeRef.current = now
        }

        // Only detect when new video frame is ready
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime

          try {
            const results = landmarker.detectForVideo(video, now)

            if (results.landmarks && results.landmarks.length > 0) {
              const rawPoints = results.landmarks[0] as LandmarkPoint[]
              lastDetectionTimeRef.current = now

              // 1. Smooth landmarks with EMA filter
              const smoothed = smootherRef.current.smooth(rawPoints)

              // 2. Classify gesture
              const recognition = recognizerRef.current.recognize(smoothed, now)

              // 3. Dispatch to InputController directly (Zero-delay WebGL response)
              handleGestureInput(recognition)

              // 4. Draw real-time hand skeleton overlay on top of video feed
              drawHandOverlay(smoothed, recognition.gesture)

              // 5. Batch sync state to store
              const gestureChanged = recognition.gesture !== lastGestureRef.current
              const shouldSyncTelemetry = now - lastStateSyncRef.current > 60

              if (gestureChanged || shouldSyncTelemetry) {
                lastStateSyncRef.current = now
                lastGestureRef.current = recognition.gesture

                useExperienceStore.getState().setHandData({
                  position: recognition.handCenter,
                  landmarks: smoothed,
                  gesture: recognition.gesture,
                  confidence: recognition.confidence,
                  fps: currentFpsRef.current,
                  pinchDistance: recognition.pinchDistance,
                  velocity: { vx: recognition.velocityX, vy: recognition.velocityY },
                })
              }
            } else {
              // No hand in current frame - clear skeleton overlay
              if (overlayCanvasRef.current) {
                const ctx = overlayCanvasRef.current.getContext('2d')
                if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
              }

              // Check timeout
              if (now - lastDetectionTimeRef.current > GESTURE_CONFIG.handDetectionTimeoutMs) {
                smootherRef.current.reset()
                recognizerRef.current.reset()
                if (useExperienceStore.getState().isHandDetected) {
                  useExperienceStore.getState().setHandDetected(false)
                }
              }
            }
          } catch (e) {
            // Non-critical frame error
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(processFrame)
    }

    rafIdRef.current = requestAnimationFrame(processFrame)
  }

  const handleGestureInput = (rec: ReturnType<GestureRecognizer['recognize']>) => {
    const store = useExperienceStore.getState()
    const sensitivity = GESTURE_CONFIG.gestureSensitivity

    switch (rec.gesture) {
      case 'MOVE_UP':
        // Hand moving upward: Increase cinematic scene progress
        inputController.addProgress(rec.deltaY * sensitivity, 'hand')
        break

      case 'MOVE_DOWN':
        // Hand moving downward: Decrease cinematic scene progress
        inputController.addProgress(rec.deltaY * sensitivity, 'hand')
        break

      case 'MOVE_LEFT':
      case 'MOVE_RIGHT':
        // Hand moving left/right: Rotate/orbit the temple camera
        inputController.addOrbit(rec.deltaX * 1.6, 0, 'hand')
        break

      case 'PINCH':
        // Static pinch: Activate focus mode if not already active
        if (!store.isFocusMode && store.currentSection >= 4) {
          // If in hotspot section, activate default hotspot
          store.activateHotspot('vimana')
        }
        break

      case 'PINCH_ZOOM_IN':
        // Pinch + upward: Zoom toward selected element
        inputController.addZoom(0.038, 'hand')
        break

      case 'PINCH_ZOOM_OUT':
        // Pinch + downward: Zoom back out
        inputController.addZoom(-0.038, 'hand')
        break

      case 'OPEN_PALM':
        // Open palm: Steady hold position (keeps camera steady)
        break

      case 'CLOSED_FIST':
        // Closed fist: Lock interaction
        if (!store.isLocked) {
          store.setIsLocked(true)
        }
        break

      case 'SWIPE_LEFT':
        // Fast horizontal swipe left: navigate to next section
        store.jumpToSection(Math.min(7, store.currentSection + 1))
        break

      case 'SWIPE_RIGHT':
        // Fast horizontal swipe right: navigate to previous section
        store.jumpToSection(Math.max(0, store.currentSection - 1))
        break

      default:
        // When fist is released, unlock
        if (store.isLocked) {
          store.setIsLocked(false)
        }
        break
    }
  }

  const cleanup = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (landmarkerRef.current) {
      landmarkerRef.current.close()
      landmarkerRef.current = null
    }
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)
    }
    smootherRef.current.reset()
    recognizerRef.current.reset()
  }

  const getGestureDescription = (gesture: GestureType) => {
    const isLocked = useExperienceStore.getState().isLocked
    const isPaused = useExperienceStore.getState().isPaused
    if (isLocked) return 'LOCKED (Fist)'
    if (isPaused) return 'PAUSED'
    switch (gesture) {
      case 'MOVE_UP':
        return 'Advancing Forward'
      case 'MOVE_DOWN':
        return 'Retreating Backward'
      case 'MOVE_LEFT':
        return 'Orbiting Left'
      case 'MOVE_RIGHT':
        return 'Orbiting Right'
      case 'PINCH':
        return 'Focusing Hotspot'
      case 'PINCH_ZOOM_IN':
        return 'Zooming In'
      case 'PINCH_ZOOM_OUT':
        return 'Zooming Out'
      case 'OPEN_PALM':
        return 'Holding Steady'
      case 'CLOSED_FIST':
        return 'Locked'
      case 'SWIPE_LEFT':
        return 'Next Chapter'
      case 'SWIPE_RIGHT':
        return 'Prev Chapter'
      default:
        return 'Hand Ready'
    }
  }

  if (!isEnabled) return null

  return (
    <aside
      aria-label="Live hand control camera feed"
      className="fixed top-5 right-5 z-40 select-none flex flex-col items-end gap-2"
    >
      {/* Top Header Pill with live indicator, FPS, and collapse toggle */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/85 border border-amber-900/50 backdrop-blur-md shadow-2xl text-xs font-mono tracking-wider transition-all duration-300">
        {isLoading ? (
          <div className="flex items-center gap-2 text-amber-300/80">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>STARTING VISION...</span>
          </div>
        ) : (
          <>
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isDetected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-500/60 animate-pulse'
              }`}
            />
            <span className="text-stone-300 font-medium text-[11px]">
              {isDetected ? 'HAND ACTIVE' : 'SEARCHING HAND'}
            </span>

            {isDetected && (
              <span className="text-stone-500 text-[10px] hidden sm:inline">
                {currentFpsRef.current} FPS
              </span>
            )}

            <span className="text-stone-700">|</span>

            {/* Toggle Preview Button */}
            <button
              type="button"
              onClick={toggleHandPreview}
              className="flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer px-1 py-0.5 rounded text-[11px]"
              title={isPreviewVisible ? 'Minimize camera feed' : 'Show camera feed'}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isPreviewVisible ? 'HIDE FEED' : 'SHOW FEED'}</span>
              {isPreviewVisible ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Floating Camera & Hand Skeleton Preview Card */}
      <div
        className={`relative transition-all duration-300 ease-out origin-top-right ${
          isPreviewVisible
            ? 'w-60 sm:w-64 opacity-100 scale-100'
            : 'w-0 h-0 opacity-0 scale-90 pointer-events-none overflow-hidden'
        }`}
      >
        <div className="relative rounded-2xl bg-stone-950/90 border border-amber-500/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.9)] p-2 overflow-hidden flex flex-col gap-2">
          {/* Video & Canvas Container */}
          <div className="relative w-full h-40 bg-stone-900/90 rounded-xl overflow-hidden border border-stone-800">
            {/* Live Camera Feed (mirrored for natural selfie view) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Live Skeleton Canvas Overlay (mirrored identical to video) */}
            <canvas
              ref={overlayCanvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100"
            />

            {/* Visual Guide when hand is not yet detected */}
            {!isDetected && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/40 backdrop-blur-[2px]">
                <Hand className="w-8 h-8 text-amber-400/80 animate-bounce mb-1" />
                <span className="text-amber-200 text-xs font-serif font-medium">
                  Raise Hand In Frame
                </span>
                <span className="text-stone-400 text-[10px] font-mono mt-0.5">
                  Keep palm facing camera
                </span>
              </div>
            )}

            {/* Active Gesture Corner Badge */}
            {isDetected && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-950/85 border border-amber-500/50 backdrop-blur-md text-[10px] font-mono text-amber-300 font-semibold shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lastGestureRef.current}</span>
              </div>
            )}
          </div>

          {/* Action description banner */}
          <div className="px-2 py-1 rounded-lg bg-stone-900/60 border border-stone-800/80 text-[11px] font-mono flex items-center justify-between text-stone-300">
            <span className="text-stone-500 text-[10px]">ACTION:</span>
            <span className="font-semibold text-amber-300 text-[11px]">
              {getGestureDescription(lastGestureRef.current)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default GestureController
