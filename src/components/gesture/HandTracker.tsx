import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import {
  Hand,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RotateCw,
  Lock,
  Pause,
  Focus,
  ZoomIn,
  ZoomOut,
  Sliders,
} from 'lucide-react'

export const HandTracker: React.FC = () => {
  const isEnabled = useExperienceStore((s) => s.isHandTrackingEnabled)
  const isDetected = useExperienceStore((s) => s.isHandDetected)
  const gesture = useExperienceStore((s) => s.detectedGesture)
  const handPos = useExperienceStore((s) => s.handPosition)
  const pinchDist = useExperienceStore((s) => s.pinchDistance)
  const isPaused = useExperienceStore((s) => s.isPaused)
  const isLocked = useExperienceStore((s) => s.isLocked)

  if (!isEnabled || !isDetected) return null

  // Lateral steering indicator
  const isSteeringRight = handPos.x > 0.62
  const isSteeringLeft = handPos.x < 0.38

  // Map active gesture to on-screen floating cue
  const getFloatingCue = () => {
    if (isLocked) {
      return {
        label: 'LOCKED',
        icon: <Lock className="w-4 h-4 text-red-400" />,
        ringColor: 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300',
      }
    }
    if (isPaused) {
      return {
        label: 'PAUSED',
        icon: <Pause className="w-4 h-4 text-amber-400" />,
        ringColor: 'border-amber-500/80',
        badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      }
    }

    switch (gesture) {
      case 'MOVE_UP':
        return {
          label: 'ADVANCING',
          icon: <ArrowUp className="w-4 h-4 text-amber-300 animate-bounce" />,
          ringColor: 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
          badgeBg: 'bg-amber-950/85 border-amber-400/60 text-amber-200',
        }
      case 'MOVE_DOWN':
        return {
          label: 'RETREATING',
          icon: <ArrowDown className="w-4 h-4 text-amber-300 animate-bounce" />,
          ringColor: 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
          badgeBg: 'bg-amber-950/85 border-amber-400/60 text-amber-200',
        }
      case 'MOVE_LEFT':
        return {
          label: 'ORBITING LEFT',
          icon: <RotateCcw className="w-4 h-4 text-emerald-400 animate-spin" />,
          ringColor: 'border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-950/85 border-emerald-400/60 text-emerald-200',
        }
      case 'MOVE_RIGHT':
        return {
          label: 'ORBITING RIGHT',
          icon: <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" />,
          ringColor: 'border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.5)]',
          badgeBg: 'bg-emerald-950/85 border-emerald-400/60 text-emerald-200',
        }
      case 'PINCH':
        return {
          label: 'PINCH FOCUS',
          icon: <Focus className="w-4 h-4 text-sky-400" />,
          ringColor: 'border-sky-400/90 shadow-[0_0_25px_rgba(56,189,248,0.5)]',
          badgeBg: 'bg-sky-950/85 border-sky-400/60 text-sky-200',
        }
      case 'PINCH_ZOOM_IN':
        return {
          label: 'ZOOM IN',
          icon: <ZoomIn className="w-4 h-4 text-sky-400 animate-pulse" />,
          ringColor: 'border-sky-400/90 shadow-[0_0_25px_rgba(56,189,248,0.5)]',
          badgeBg: 'bg-sky-950/85 border-sky-400/60 text-sky-200',
        }
      case 'PINCH_ZOOM_OUT':
        return {
          label: 'ZOOM OUT',
          icon: <ZoomOut className="w-4 h-4 text-sky-400 animate-pulse" />,
          ringColor: 'border-sky-400/90 shadow-[0_0_25px_rgba(56,189,248,0.5)]',
          badgeBg: 'bg-sky-950/85 border-sky-400/60 text-sky-200',
        }
      case 'OPEN_PALM':
        return {
          label: 'STEADY HOLD',
          icon: <Hand className="w-4 h-4 text-amber-300" />,
          ringColor: 'border-amber-300/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
          badgeBg: 'bg-amber-950/80 border-amber-300/50 text-amber-200',
        }
      case 'CLOSED_FIST':
        return {
          label: 'LOCKED',
          icon: <Lock className="w-4 h-4 text-red-400" />,
          ringColor: 'border-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
          badgeBg: 'bg-red-950/80 border-red-400/50 text-red-300',
        }
      case 'SWIPE_LEFT':
      case 'SWIPE_RIGHT':
        return {
          label: 'CHAPTER JUMP',
          icon: <Sliders className="w-4 h-4 text-purple-400" />,
          ringColor: 'border-purple-400/80',
          badgeBg: 'bg-purple-950/80 border-purple-400/50 text-purple-300',
        }
      default:
        if (isSteeringRight) {
          return {
            label: 'STEERING RIGHT',
            icon: <RotateCw className="w-3.5 h-3.5 text-amber-300" />,
            ringColor: 'border-amber-400/80',
            badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          }
        }
        if (isSteeringLeft) {
          return {
            label: 'STEERING LEFT',
            icon: <RotateCcw className="w-3.5 h-3.5 text-amber-300" />,
            ringColor: 'border-amber-400/80',
            badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          }
        }
        return {
          label: 'HAND READY',
          icon: <Hand className="w-3.5 h-3.5 text-stone-400" />,
          ringColor: 'border-amber-500/40',
          badgeBg: 'bg-stone-950/70 border-stone-800 text-stone-400',
        }
    }
  }

  const cue = getFloatingCue()

  // Calculate dynamic pinch visual ring size
  const pinchRingRadius = Math.max(12, Math.min(32, (pinchDist || 0.15) * 160))

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none transition-transform duration-75 ease-out z-30 select-none"
      style={{
        left: `${handPos.x * 100}vw`,
        top: `${handPos.y * 100}vh`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer reticle halo */}
        <div
          className={`w-16 h-16 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${cue.ringColor} ${
            gesture.startsWith('PINCH')
              ? 'scale-80'
              : gesture === 'OPEN_PALM'
              ? 'scale-110'
              : 'scale-95'
          }`}
        >
          {/* Subtle crosshairs */}
          <div className="absolute w-2.5 h-0.5 bg-amber-400/70 left-0" />
          <div className="absolute w-2.5 h-0.5 bg-amber-400/70 right-0" />
          <div className="absolute h-2.5 w-0.5 bg-amber-400/70 top-0" />
          <div className="absolute h-2.5 w-0.5 bg-amber-400/70 bottom-0" />

          {/* Dynamic Pinch Proximity Ring */}
          <div
            className="absolute rounded-full border border-sky-400/60 pointer-events-none transition-all duration-75"
            style={{
              width: `${pinchRingRadius * 2}px`,
              height: `${pinchRingRadius * 2}px`,
              opacity: gesture.startsWith('PINCH') ? 1 : 0.25,
            }}
          />

          {/* Central tracking core */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-colors duration-150 ${
              gesture.startsWith('PINCH')
                ? 'bg-sky-400 shadow-[0_0_12px_#38bdf8]'
                : isLocked
                ? 'bg-red-400 shadow-[0_0_12px_#f87171]'
                : 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
            }`}
          />
        </div>

        {/* Floating gesture badge above reticle when action is active */}
        {(gesture !== 'NONE' || isSteeringLeft || isSteeringRight) && (
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md font-mono text-[10px] font-semibold tracking-wider shadow-xl transition-all duration-150 ${cue.badgeBg}`}
          >
            {cue.icon}
            <span>{cue.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default HandTracker
