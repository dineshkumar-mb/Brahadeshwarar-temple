import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * Subtle atmospheric dust motes drifting upward over the temple courtyard.
 * Uses warm golden/amber tones. NOT a starfield.
 * Count scales based on sceneProgress (appears as you approach the temple).
 */
export const TempleParticles: React.FC = () => {
  const meshRef = useRef<THREE.Points | null>(null)
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)

  // Create 300 dust motes around the temple courtyard
  const { positions, velocities, phases } = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Spread dust within the courtyard footprint
      positions[i3] = (Math.random() - 0.5) * 60     // x: -30 to 30
      positions[i3 + 1] = Math.random() * 18           // y: 0 to 18m
      positions[i3 + 2] = (Math.random() - 0.5) * 70  // z: -35 to 35

      // Very slow upward drift with slight horizontal wobble
      velocities[i3] = (Math.random() - 0.5) * 0.008
      velocities[i3 + 1] = Math.random() * 0.025 + 0.008  // upward
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.008

      phases[i] = Math.random() * Math.PI * 2
    }

    return { positions, velocities, phases }
  }, [])

  // Animated buffer attribute
  const positionBuffer = useMemo(() => {
    return new THREE.BufferAttribute(positions.slice(), 3)
  }, [positions])

  useFrame(({ clock }) => {
    if (!meshRef.current || reducedMotion) return
    
    const t = clock.getElapsedTime()
    const pos = positionBuffer.array as Float32Array
    const visibility = Math.max(0, (sceneProgress - 0.05) * 2.5) // fade in as temple approaches

    for (let i = 0; i < 300; i++) {
      const i3 = i * 3
      // Drift upward
      pos[i3] += velocities[i3] + Math.sin(t * 0.3 + phases[i]) * 0.003
      pos[i3 + 1] += velocities[i3 + 1]
      pos[i3 + 2] += velocities[i3 + 2]

      // Reset when drifted above 20m
      if (pos[i3 + 1] > 20) {
        pos[i3 + 1] = 0
        pos[i3] = (Math.random() - 0.5) * 60
        pos[i3 + 2] = (Math.random() - 0.5) * 70
      }
    }

    positionBuffer.needsUpdate = true

    if (meshRef.current.material) {
      const mat = meshRef.current.material as THREE.PointsMaterial
      mat.opacity = visibility * 0.55
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <primitive object={positionBuffer} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#e8c97a"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default TempleParticles
