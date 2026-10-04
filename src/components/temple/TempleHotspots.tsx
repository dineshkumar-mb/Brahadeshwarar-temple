import React from 'react'
import { Html } from '@react-three/drei'
import { useExperienceStore } from '../../state/experienceStore'
import { TEMPLE_HOTSPOTS } from '../../data/templeData'
import { Sparkles, Eye } from 'lucide-react'

export const TempleHotspots: React.FC = () => {
  const isFocusMode = useExperienceStore((s) => s.isFocusMode)
  const activeHotspotId = useExperienceStore((s) => s.activeHotspotId)
  const activateHotspot = useExperienceStore((s) => s.activateHotspot)
  const exitFocusMode = useExperienceStore((s) => s.exitFocusMode)
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)

  // Hotspots become prominent in Section 4, 5, 6 (progress >= 0.50)
  const isVisible = sceneProgress >= 0.45

  if (!isVisible) return null

  return (
    <group name="TempleHotspots">
      {TEMPLE_HOTSPOTS.map((hotspot) => {
        const isActive = activeHotspotId === hotspot.id

        return (
          <group key={hotspot.id} position={hotspot.position}>
            {/* Subtle 3D glowing anchor point */}
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                if (isActive) {
                  exitFocusMode()
                } else {
                  activateHotspot(hotspot.id)
                }
              }}
            >
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshBasicMaterial
                color={isActive ? '#38bdf8' : '#eab308'}
                transparent
                opacity={isActive ? 0.9 : 0.6}
              />
            </mesh>

            {/* Pulsing ring indicator */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.6, 24]} />
              <meshBasicMaterial
                color={isActive ? '#38bdf8' : '#fbbf24'}
                transparent
                opacity={isActive ? 0.8 : 0.4}
              />
            </mesh>

            {/* Interactive HTML Billboard tag */}
            <Html
              position={[0, 0.8, 0]}
              center
              zIndexRange={[10, 20]}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (isActive) {
                    exitFocusMode()
                  } else {
                    activateHotspot(hotspot.id)
                  }
                }}
                className={`group interactive-ui flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 transform active:scale-95 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-950/90 border border-sky-400 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                    : 'bg-stone-950/80 border border-amber-500/40 text-stone-200 hover:border-amber-400 hover:bg-stone-900 shadow-xl'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-sky-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span className="font-serif text-xs font-semibold tracking-wide">
                  {hotspot.title}
                </span>
                <Eye className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
