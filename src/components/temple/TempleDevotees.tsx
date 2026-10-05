import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

// Palette of traditional South Indian temple attire
const ATTIRE_COLORS = [
  { saree: '#831843', border: '#f59e0b', type: 'woman_saree' }, // Deep Maroon & Gold Zari
  { saree: '#b45309', border: '#fef08a', type: 'woman_saree' }, // Saffron Gold & Yellow
  { saree: '#065f46', border: '#fbbf24', type: 'woman_saree' }, // Emerald Temple Green
  { saree: '#1e40af', border: '#fde047', type: 'woman_saree' }, // Peacock Blue
  { saree: '#991b1b', border: '#d97706', type: 'woman_saree' }, // Crimson Chola Silk
  { saree: '#fafaf9', border: '#eab308', type: 'priest_veshti' }, // Sacred White Silk Veshti & Gold
  { saree: '#f5f5f4', border: '#b91c1c', type: 'man_veshti' },   // White Veshti & Red Border
  { saree: '#fffbeb', border: '#d97706', type: 'priest_veshti' }, // Ivory Dhoti with Angavastram
]

interface DevoteeConfig {
  id: string
  type: 'woman_saree' | 'priest_veshti' | 'man_veshti'
  attireColor: string
  borderColor: string
  skinColor: string
  pathType: 'gopuram_loop_cw' | 'gopuram_loop_ccw' | 'entrance_approach' | 'kodimaram_loop'
  baseSpeed: number
  startOffset: number
  scale: number
  hasThaliLamp?: boolean
  isPrayerHands?: boolean
}

// 8 Unique Devotees walking respectfully around the Gopuram and Sacred Axial Way
const DEVOTEES_CONFIG: DevoteeConfig[] = [
  {
    id: 'priest_lead',
    type: 'priest_veshti',
    attireColor: '#fdfbf7',
    borderColor: '#eab308',
    skinColor: '#8d5524',
    pathType: 'entrance_approach',
    baseSpeed: 0.16,
    startOffset: 0.05,
    scale: 1.02,
    hasThaliLamp: true,
  },
  {
    id: 'woman_maroon',
    type: 'woman_saree',
    attireColor: '#831843',
    borderColor: '#f59e0b',
    skinColor: '#9c6b3e',
    pathType: 'gopuram_loop_cw',
    baseSpeed: 0.14,
    startOffset: 0.22,
    scale: 0.96,
    hasThaliLamp: true,
  },
  {
    id: 'man_pilgrim',
    type: 'man_veshti',
    attireColor: '#f5f5f4',
    borderColor: '#b91c1c',
    skinColor: '#78461f',
    pathType: 'gopuram_loop_cw',
    baseSpeed: 0.15,
    startOffset: 0.72,
    scale: 1.0,
    isPrayerHands: true,
  },
  {
    id: 'woman_saffron',
    type: 'woman_saree',
    attireColor: '#b45309',
    borderColor: '#fef08a',
    skinColor: '#a17042',
    pathType: 'gopuram_loop_ccw',
    baseSpeed: 0.13,
    startOffset: 0.48,
    scale: 0.95,
  },
  {
    id: 'priest_perambulate',
    type: 'priest_veshti',
    attireColor: '#fffbeb',
    borderColor: '#d97706',
    skinColor: '#885121',
    pathType: 'gopuram_loop_cw',
    baseSpeed: 0.145,
    startOffset: 0.92,
    scale: 1.01,
    isPrayerHands: true,
  },
  {
    id: 'woman_emerald',
    type: 'woman_saree',
    attireColor: '#065f46',
    borderColor: '#fbbf24',
    skinColor: '#986638',
    pathType: 'entrance_approach',
    baseSpeed: 0.135,
    startOffset: 0.55,
    scale: 0.97,
  },
  {
    id: 'devotee_kodimaram',
    type: 'man_veshti',
    attireColor: '#f5f5f4',
    borderColor: '#eab308',
    skinColor: '#804c22',
    pathType: 'kodimaram_loop',
    baseSpeed: 0.15,
    startOffset: 0.15,
    scale: 0.98,
    isPrayerHands: true,
  },
  {
    id: 'woman_blue',
    type: 'woman_saree',
    attireColor: '#1e40af',
    borderColor: '#fde047',
    skinColor: '#a87545',
    pathType: 'kodimaram_loop',
    baseSpeed: 0.125,
    startOffset: 0.65,
    scale: 0.94,
    hasThaliLamp: true,
  },
]

/**
 * Calculates world-space position and heading angle along defined paths
 */
function evaluatePath(pathType: DevoteeConfig['pathType'], progress: number): {
  x: number
  z: number
  heading: number
} {
  const norm = ((progress % 1.0) + 1.0) % 1.0
  let x = 0
  let z = 128
  let dx = 0
  let dz = 0

  switch (pathType) {
    case 'gopuram_loop_cw': {
      // Smooth rounded loop around the monumental base of Keralantakan Gopuram (z ~ 128)
      const angle = norm * Math.PI * 2
      const rx = 12.8
      const rz = 11.5
      x = Math.cos(angle) * rx
      z = 128 + Math.sin(angle) * rz
      // Tangent for forward facing
      dx = -Math.sin(angle) * rx
      dz = Math.cos(angle) * rz
      break
    }

    case 'gopuram_loop_ccw': {
      // Counter-clockwise circumambulation
      const angle = -norm * Math.PI * 2
      const rx = 14.5
      const rz = 13.0
      x = Math.cos(angle) * rx
      z = 128 + Math.sin(angle) * rz
      dx = Math.sin(angle) * rx
      dz = -Math.cos(angle) * rz
      break
    }

    case 'entrance_approach': {
      // Two-way contemplative walk through the Gopuram gateway:
      // z goes from 165 (outer courtyard) -> 128 (under gopuram arch) -> 98 (towards kodimaram) and back
      const cycle = Math.sin(norm * Math.PI * 2)
      z = 131 + cycle * 32
      // Slight lateral offset so they walk on the right-hand side of the path
      x = Math.cos(norm * Math.PI * 2) > 0 ? 2.4 : -2.4
      dz = Math.cos(norm * Math.PI * 2) * 32
      dx = 0
      break
    }

    case 'kodimaram_loop': {
      // Pradakshina loop around Kodimaram flag mast (z ~ 86)
      const angle = norm * Math.PI * 2
      const rx = 6.2
      const rz = 6.8
      x = Math.cos(angle) * rx
      z = 86 + Math.sin(angle) * rz
      dx = -Math.sin(angle) * rx
      dz = Math.cos(angle) * rz
      break
    }
  }

  const heading = Math.atan2(dx, dz)
  return { x, z, heading }
}

/**
 * Individual Devotee 3D Rigged Figure
 */
interface SingleDevoteeProps {
  config: DevoteeConfig
  timeOfDay: 'day' | 'night'
}

const SingleDevotee: React.FC<SingleDevoteeProps> = ({ config, timeOfDay }) => {
  const rootRef = useRef<THREE.Group | null>(null)
  const leftLegRef = useRef<THREE.Group | null>(null)
  const rightLegRef = useRef<THREE.Group | null>(null)
  const leftArmRef = useRef<THREE.Group | null>(null)
  const rightArmRef = useRef<THREE.Group | null>(null)
  const torsoRef = useRef<THREE.Group | null>(null)
  const flameLightRef = useRef<THREE.PointLight | null>(null)
  const flameMeshRef = useRef<THREE.Mesh | null>(null)

  const progressRef = useRef(config.startOffset)

  // Pre-created materials for performance & zero GC
  const {
    skinMat,
    attireMat,
    borderMat,
    dhotiPleatMat,
    hairMat,
    jasmineMat,
    brassMat,
  } = useMemo(() => {
    return {
      skinMat: new THREE.MeshStandardMaterial({
        color: config.skinColor,
        roughness: 0.72,
        metalness: 0.05,
      }),
      attireMat: new THREE.MeshStandardMaterial({
        color: config.attireColor,
        roughness: 0.65,
        metalness: 0.12, // subtle silk sheen
      }),
      borderMat: new THREE.MeshStandardMaterial({
        color: config.borderColor,
        roughness: 0.35,
        metalness: 0.75, // Golden zari border
      }),
      dhotiPleatMat: new THREE.MeshStandardMaterial({
        color: config.attireColor,
        roughness: 0.78,
      }),
      hairMat: new THREE.MeshStandardMaterial({
        color: '#1a1410',
        roughness: 0.85,
      }),
      jasmineMat: new THREE.MeshStandardMaterial({
        color: '#fffef0',
        roughness: 0.6,
      }),
      brassMat: new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        metalness: 0.88,
        roughness: 0.22,
      }),
    }
  }, [config])

  useFrame((_, delta) => {
    if (!rootRef.current) return

    // Advance path progress smoothly
    progressRef.current += config.baseSpeed * delta * 0.15
    const { x, z, heading } = evaluatePath(config.pathType, progressRef.current)

    // Position and orient root along tangent
    rootRef.current.position.x = x
    rootRef.current.position.z = z
    rootRef.current.rotation.y = heading

    // Natural Walking Kinematics (step cycle frequency ~ 4.2 rad/s)
    const stepFreq = config.baseSpeed * 28.0
    const stepPhase = progressRef.current * stepFreq

    // 1. Alternating leg swing
    const legPitch = Math.sin(stepPhase) * 0.42
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = legPitch
      rightLegRef.current.rotation.x = -legPitch
    }

    // 2. Arms swing in natural counter-balance (unless holding prayer / thali)
    if (!config.isPrayerHands && !config.hasThaliLamp) {
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -legPitch * 0.65
        rightArmRef.current.rotation.x = legPitch * 0.65
      }
    }

    // 3. Torso bobbing (vertical displacement at double the step frequency)
    if (torsoRef.current) {
      torsoRef.current.position.y = 0.88 + Math.abs(Math.sin(stepPhase)) * 0.038
      // Subtle pelvic sway
      torsoRef.current.rotation.z = Math.sin(stepPhase * 0.5) * 0.02
    }

    // 4. Flame flicker if carrying deepam puja thali
    if (flameLightRef.current && flameMeshRef.current) {
      const flicker = Math.sin(stepPhase * 3.7) * 0.12 + Math.random() * 0.06
      flameLightRef.current.intensity = (timeOfDay === 'night' ? 1.6 : 0.6) + flicker
      const s = 1.0 + flicker * 0.4
      flameMeshRef.current.scale.set(s, s * 1.3, s)
    }
  })

  const isWoman = config.type === 'woman_saree'
  const isPriest = config.type === 'priest_veshti'

  return (
    <group ref={rootRef} scale={config.scale}>
      {/* ── LOWER BODY & LEGS ── */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.82, 0]}>
        {/* Thigh / Upper Leg with Veshti / Saree draping */}
        <mesh castShadow position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.085, 0.07, 0.84, 10]} />
          <primitive object={isWoman ? attireMat : dhotiPleatMat} />
        </mesh>
        {/* Foot with bare skin tone */}
        <mesh castShadow position={[0, -0.84, 0.05]}>
          <boxGeometry args={[0.09, 0.05, 0.18]} />
          <primitive object={skinMat} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.82, 0]}>
        <mesh castShadow position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.085, 0.07, 0.84, 10]} />
          <primitive object={isWoman ? attireMat : dhotiPleatMat} />
        </mesh>
        <mesh castShadow position={[0, -0.84, 0.05]}>
          <boxGeometry args={[0.09, 0.05, 0.18]} />
          <primitive object={skinMat} />
        </mesh>
      </group>

      {/* ── UPPER BODY & TORSO (Bobs vertically with step) ── */}
      <group ref={torsoRef} position={[0, 0.88, 0]}>
        {/* Waist / Hips / Saree Pallu / Dhoti Belt */}
        <mesh castShadow position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.18, 0.16, 0.28, 12]} />
          <primitive object={attireMat} />
        </mesh>

        {/* Zari Border / Golden Belt accent */}
        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.182, 0.182, 0.04, 12]} />
          <primitive object={borderMat} />
        </mesh>

        {/* Chest / Torso */}
        <mesh castShadow position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.2, 0.17, 0.36, 12]} />
          <primitive object={isPriest ? skinMat : attireMat} />
        </mesh>

        {/* Priest Sacred Thread (Yajnopavita / Poonool) across bare torso */}
        {isPriest && (
          <mesh position={[0, 0.42, 0.15]} rotation={[0, 0, -0.55]}>
            <boxGeometry args={[0.015, 0.46, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )}

        {/* Saree Pleats / Angavastram Scarf over Shoulder */}
        {isWoman ? (
          <mesh castShadow position={[-0.05, 0.38, 0.1]}>
            <boxGeometry args={[0.16, 0.44, 0.12]} />
            <primitive object={borderMat} />
          </mesh>
        ) : (
          <mesh castShadow position={[-0.14, 0.46, 0]}>
            <boxGeometry args={[0.08, 0.48, 0.18]} />
            <primitive object={attireMat} />
          </mesh>
        )}

        {/* Neck */}
        <mesh castShadow position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.12, 10]} />
          <primitive object={skinMat} />
        </mesh>

        {/* ── HEAD & HAIR ── */}
        <group position={[0, 0.78, 0]}>
          {/* Head */}
          <mesh castShadow position={[0, 0, 0]}>
            <sphereGeometry args={[0.115, 14, 14]} />
            <primitive object={skinMat} />
          </mesh>

          {/* Sacred Vibhuti / Holy Ash Mark on Forehead */}
          <mesh position={[0, 0.04, 0.11]}>
            <boxGeometry args={[0.07, 0.018, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.04, 0.115]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#b91c1c" />
          </mesh>

          {/* Hair & Traditional Ornaments */}
          {isWoman ? (
            <>
              {/* Traditional hair bun / Kondai */}
              <mesh castShadow position={[0, 0.02, -0.1]}>
                <sphereGeometry args={[0.085, 10, 10]} />
                <primitive object={hairMat} />
              </mesh>
              {/* String of fragrant White Jasmine Flowers (Mallipoo) */}
              <mesh position={[0, 0.02, -0.095]}>
                <torusGeometry args={[0.09, 0.022, 8, 16]} />
                <primitive object={jasmineMat} />
              </mesh>
            </>
          ) : (
            /* Traditional hair / Kudumi */
            <mesh castShadow position={[0, 0.08, -0.06]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <primitive object={hairMat} />
            </mesh>
          )}
        </group>

        {/* ── ARMS & PROPS ── */}
        {config.isPrayerHands ? (
          /* Anjali Mudra / Folded Hands in Reverence */
          <group position={[0, 0.38, 0.22]}>
            <mesh castShadow position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.08, 0.14, 0.04]} />
              <primitive object={skinMat} />
            </mesh>
          </group>
        ) : config.hasThaliLamp ? (
          /* Carrying Traditional Brass Puja Thali with Flowers & Glowing Deepam */
          <group position={[0, 0.28, 0.28]}>
            {/* Forearms supporting the plate */}
            <mesh position={[-0.1, -0.06, -0.08]} rotation={[0.6, 0.2, 0]}>
              <cylinderGeometry args={[0.035, 0.04, 0.24, 8]} />
              <primitive object={skinMat} />
            </mesh>
            <mesh position={[0.1, -0.06, -0.08]} rotation={[0.6, -0.2, 0]}>
              <cylinderGeometry args={[0.035, 0.04, 0.24, 8]} />
              <primitive object={skinMat} />
            </mesh>

            {/* Brass Puja Thali (Plate) */}
            <mesh castShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.14, 0.02, 16]} />
              <primitive object={brassMat} />
            </mesh>

            {/* Coconut & Red Flowers */}
            <mesh position={[-0.04, 0.03, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#854d0e" roughness={0.9} />
            </mesh>
            <mesh position={[0.04, 0.025, -0.03]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>

            {/* Sacred Brass Deepam Oil Lamp */}
            <mesh position={[0.02, 0.03, 0.04]}>
              <cylinderGeometry args={[0.04, 0.02, 0.035, 10]} />
              <primitive object={brassMat} />
            </mesh>

            {/* Glowing Flame */}
            <mesh ref={flameMeshRef} position={[0.02, 0.065, 0.04]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ffaa22" />
            </mesh>

            {/* Dynamic warm illumination from lamp */}
            <pointLight
              ref={flameLightRef}
              position={[0.02, 0.12, 0.04]}
              color="#ffaa33"
              intensity={timeOfDay === 'night' ? 1.6 : 0.6}
              distance={3.2}
              decay={2}
            />
          </group>
        ) : (
          /* Natural Walking Arms */
          <>
            <group ref={leftArmRef} position={[-0.24, 0.54, 0]}>
              <mesh castShadow position={[0, -0.24, 0]}>
                <cylinderGeometry args={[0.042, 0.038, 0.52, 8]} />
                <primitive object={skinMat} />
              </mesh>
            </group>
            <group ref={rightArmRef} position={[0.24, 0.54, 0]}>
              <mesh castShadow position={[0, -0.24, 0]}>
                <cylinderGeometry args={[0.042, 0.038, 0.52, 8]} />
                <primitive object={skinMat} />
              </mesh>
            </group>
          </>
        )}
      </group>
    </group>
  )
}

/**
 * TempleDevotees – Main Export
 * Populates authentic Chola temple devotees, kurukkal priests, and pilgrims
 * walking around the monumental Gopuram and sacred courtyard.
 */
export const TempleDevotees: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)

  return (
    <group name="TempleDevotees">
      {DEVOTEES_CONFIG.map((cfg) => (
        <SingleDevotee key={cfg.id} config={cfg} timeOfDay={timeOfDay} />
      ))}
    </group>
  )
}

export default TempleDevotees
