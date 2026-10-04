import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * Kodimaram (Dhwajasthambham) & Bali Peetham
 * ──────────────────────────────────────────
 * The sacred flag mast of the Brihadisvara Temple complex.
 * Situated along the primary East-West cosmic axis (X = 0, Z = 86),
 * directly between the Keralantakan Rajagopuram (Z = 128) and the
 * Monolithic Nandi Mandapam (Z = 66), facing the sanctum sanctorum.
 *
 * Architectural & Spiritual Features:
 * 1. Stepped Granite Adhishthana (Pedestal) & Upapitha base
 * 2. Ornate Stone Bali Peetham (Offering Altar with 8-fold lotus petals)
 * 3. Segmented Gilded Brass/Copper Mast with 33 sacred rings (representing Sushumna Nadi)
 * 4. T-shaped cross arms (Yasti) with suspended brass temple bells (Ghanta)
 * 5. Fluttering Saffron Chola Pennant (Dhwaja Flag with Rishabha / Trishula motif)
 * 6. Gilded Kalasam Stupi pinnacle reaching 16 meters skyward
 * 7. Sacred flickering bronze Deepam oil lamps at its base
 */
export const Kodimaram: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const flagRef = useRef<THREE.Mesh | null>(null)
  const lampLightRef = useRef<THREE.PointLight | null>(null)

  // 1. Procedural stone bump map for authentic granite pedestal
  const graniteBump = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, 128, 128)
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 128
        const y = Math.random() * 128
        const v = Math.floor(Math.random() * 80 + 80)
        ctx.fillStyle = `rgb(${v},${v},${v})`
        ctx.fillRect(x, y, 1.5, 1.5)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4)
    return tex
  }, [])

  // 2. Dynamic Wind Animation for Saffron Silk Flag & Sacred Oil Lamp Flicker
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Flag flutter (wind waving along X axis)
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 3.2) * 0.12 + Math.cos(t * 1.7) * 0.08
      flagRef.current.rotation.z = Math.sin(t * 2.4) * 0.04
    }

    // Oil lamp flame organic intensity pulsation
    if (lampLightRef.current) {
      const flicker = 0.85 + Math.sin(t * 12.0) * 0.08 + Math.cos(t * 21.0) * 0.06
      lampLightRef.current.intensity = (timeOfDay === 'night' ? 2.4 : 1.2) * flicker
    }
  })

  // Position coordinates along axial courtyard
  const posX = 0
  const posZ = 86.0
  const baliPeethamZ = 90.2

  return (
    <group position={[posX, 0, posZ]}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. MOLDED GRANITE ADHISHTHANA PEDESTAL                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Square Lower Foundation Plinth */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.7, 4.2]} />
        <meshStandardMaterial
          color="#9c6c40"
          roughness={0.88}
          metalness={0.03}
          bumpMap={graniteBump}
          bumpScale={0.03}
        />
      </mesh>

      {/* Stepped Second Plinth with Chamfered Edges */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.45, 3.4]} />
        <meshStandardMaterial
          color="#8a5c32"
          roughness={0.85}
          metalness={0.03}
          bumpMap={graniteBump}
          bumpScale={0.03}
        />
      </mesh>

      {/* Octagonal Plinth Tier (Ashtabhadra Pitha) */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.55, 0.55, 8]} />
        <meshStandardMaterial
          color="#aa7644"
          roughness={0.78}
          metalness={0.05}
          bumpMap={graniteBump}
          bumpScale={0.04}
        />
      </mesh>

      {/* Molded Circular Lotus Ring (Padma Pitha) */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.25, 0.28, 24]} />
        <meshStandardMaterial
          color="#c28c54"
          roughness={0.65}
          metalness={0.12}
        />
      </mesh>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. GILDED BRONZE / BRASS MAST WITH 33 KANKANA RINGS           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Heavy Flanged Brass Base Collar */}
      <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.85, 0.45, 24]} />
        <meshStandardMaterial
          color="#f2b33d"
          roughness={0.24}
          metalness={0.88}
          emissive="#382002"
        />
      </mesh>

      {/* Main Soaring Cylindrical Mast (14.5m tall) */}
      <mesh position={[0, 9.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.44, 14.5, 24]} />
        <meshStandardMaterial
          color="#e09e2d"
          roughness={0.22}
          metalness={0.92}
          emissive="#2b1800"
        />
      </mesh>

      {/* 33 Segmented Torus Rings (Sushumna Nadi Kundalini Vertebrae) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const ringY = 2.6 + i * 0.56
        const taper = 1.0 - (i / 24) * 0.35
        return (
          <mesh key={i} position={[0, ringY, 0]} castShadow>
            <torusGeometry args={[0.42 * taper, 0.055 * taper, 12, 24]} />
            <meshStandardMaterial
              color="#ffc34d"
              roughness={0.18}
              metalness={0.95}
              emissive="#3f2503"
            />
          </mesh>
        )
      })}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. UPPER CROSS ARMS (YASTI) & TEMPLE BELLS (GHANTA)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MULTI-TIERED STEPPED BRACKET ARMS & BELLS (matching photo) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Capital Cornice Block near top */}
      <mesh position={[0, 15.6, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.42, 0.5, 16]} />
        <meshStandardMaterial
          color="#cf7836"
          roughness={0.28}
          metalness={0.85}
          emissive="#2a1505"
        />
      </mesh>

      {/* 3 Stepped Projecting Bracket Tiers (as clearly visible in kodimaram.jpg) */}
      {[
        { y: 16.0, w: 2.8, depth: 0.22, bells: 5 },
        { y: 16.4, w: 2.2, depth: 0.20, bells: 4 },
        { y: 16.8, w: 1.6, depth: 0.18, bells: 3 },
      ].map((tier, tIdx) => (
        <group key={tIdx} position={[0, tier.y, 0]}>
          {/* Main East-West horizontal bracket beam */}
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.18, tier.w]} />
            <meshStandardMaterial
              color="#cf7836"
              roughness={0.26}
              metalness={0.88}
              emissive="#241203"
            />
          </mesh>

          {/* Stepped corbel ends */}
          {[-tier.w / 2, tier.w / 2].map((endZ, eIdx) => (
            <mesh key={eIdx} position={[0, -0.08, endZ]}>
              <boxGeometry args={[0.24, 0.12, 0.16]} />
              <meshStandardMaterial color="#ba6527" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}

          {/* Suspended Bronze Bells below this bracket tier */}
          {Array.from({ length: tier.bells }).map((_, bIdx) => {
            const bellOffsetZ = -tier.w / 2 + 0.25 + (bIdx / (tier.bells - 1 || 1)) * (tier.w - 0.5)
            return (
              <group key={bIdx} position={[0, -0.22, bellOffsetZ]}>
                {/* Thin chain */}
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.16, 6]} />
                  <meshStandardMaterial color="#aa5820" metalness={0.8} />
                </mesh>
                {/* Miniature Bronze Temple Bell */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.05, 0.12, 0.2, 12]} />
                  <meshStandardMaterial
                    color="#f5b842"
                    roughness={0.2}
                    metalness={0.92}
                    emissive="#331c00"
                  />
                </mesh>
              </group>
            )
          })}
        </group>
      ))}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. CEREMONIAL CLOTH PENNANTS (white, saffron, red in photo)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <group position={[0, 15.6, -0.35]}>
        {/* Main fluttering white & saffron sacred flag */}
        <mesh ref={flagRef} position={[0, -1.2, -0.4]} castShadow>
          <boxGeometry args={[0.04, 3.2, 0.9]} />
          <meshStandardMaterial
            color="#fff8eb"
            roughness={0.92}
            metalness={0.02}
          />
        </mesh>

        {/* Secondary Saffron/Orange Ribbon Banner */}
        <mesh position={[0.05, -1.0, -0.1]} castShadow>
          <boxGeometry args={[0.03, 2.6, 0.45]} />
          <meshStandardMaterial
            color="#e65100"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>

        {/* Sacred Vermilion Red Fabric Wrap tied around mid-shaft (as seen in kodimaram.jpg) */}
        <mesh position={[0, -5.2, 0.35]}>
          <cylinderGeometry args={[0.38, 0.42, 1.2, 20]} />
          <meshStandardMaterial
            color="#b71c1c"
            roughness={0.95}
            metalness={0.02}
          />
        </mesh>
      </group>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. GILDED PINNACLE KALASAM STUPI                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Kalasam Bulbous Pot (Kumbha) */}
      <mesh position={[0, 17.0, 0]} castShadow>
        <sphereGeometry args={[0.42, 24, 20]} />
        <meshStandardMaterial
          color="#ffd466"
          roughness={0.14}
          metalness={0.96}
          emissive="#452700"
        />
      </mesh>

      {/* Pointed Needle Finial Spike (Shikhara Spire) */}
      <mesh position={[0, 17.65, 0]} castShadow>
        <coneGeometry args={[0.16, 1.0, 16]} />
        <meshStandardMaterial
          color="#ffe082"
          roughness={0.12}
          metalness={0.98}
          emissive="#553000"
        />
      </mesh>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. SACRED BALI PEETHAM (Offering Altar in Front)              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, baliPeethamZ - posZ]}>
        {/* Tier 1 - Square Base Plinth */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.55, 2.4]} />
          <meshStandardMaterial
            color="#9c6c40"
            roughness={0.85}
            metalness={0.02}
            bumpMap={graniteBump}
            bumpScale={0.035}
          />
        </mesh>

        {/* Tier 2 - Octagonal Molded Belt */}
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 1.15, 0.4, 8]} />
          <meshStandardMaterial
            color="#8a5c32"
            roughness={0.82}
            metalness={0.04}
            bumpMap={graniteBump}
            bumpScale={0.035}
          />
        </mesh>

        {/* Tier 3 - Inverted Lotus Neck (Kantham) */}
        <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.88, 0.3, 16]} />
          <meshStandardMaterial
            color="#aa7644"
            roughness={0.75}
            metalness={0.06}
          />
        </mesh>

        {/* Tier 4 - Expanded 16-Petal Open Lotus Altar (Padma Peetham) */}
        <mesh position={[0, 1.32, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.08, 0.65, 0.32, 16]} />
          <meshStandardMaterial
            color="#c28c54"
            roughness={0.7}
            metalness={0.08}
            bumpMap={graniteBump}
            bumpScale={0.04}
          />
        </mesh>

        {/* Polished Altar Capstone for sacred rice / flower offerings */}
        <mesh position={[0, 1.52, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.1, 24]} />
          <meshStandardMaterial
            color="#3a2e26"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. SACRED FLICKERING DEEPAM OIL LAMPS AROUND BASE             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {[
        { x: -1.4, z: -1.4 },
        { x: 1.4, z: -1.4 },
        { x: -1.4, z: 1.4 },
        { x: 1.4, z: 1.4 },
      ].map((pt, i) => (
        <group key={i} position={[pt.x, 0.7, pt.z]}>
          {/* Bronze Lamp Pedestal (Kuthu Vilakku) */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.18, 0.5, 12]} />
            <meshStandardMaterial color="#f0b643" metalness={0.85} roughness={0.28} />
          </mesh>
          {/* Oil Reservoir Basin */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.08, 0.12, 16]} />
            <meshStandardMaterial color="#e5a935" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Glowing Flame */}
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.06, 12, 10]} />
            <meshBasicMaterial color="#ff9922" />
          </mesh>
        </group>
      ))}

      {/* Warm Ambient Sacred Light Cast by Deepams */}
      <pointLight
        ref={lampLightRef}
        position={[0, 1.8, 0]}
        color="#ff9d3b"
        distance={12}
        decay={2}
      />
    </group>
  )
}

export default Kodimaram
