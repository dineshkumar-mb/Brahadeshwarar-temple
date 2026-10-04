import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * Cinematic Heritage Lighting for Brihadisvara Temple
 *
 * Supports a smooth day ↔ night cycle:
 *   DAY  – Golden Chola morning sunlight: warm hemi, directional sun, blue sky fill,
 *           golden Vimana rim, sacred deepam point lights.
 *   NIGHT – Full-moon silver: cool directional moon light, deep-indigo hemi,
 *           sacred oil-lamp lamps glow more dramatically against dark sky.
 *
 * All values lerp smoothly when timeOfDay changes, with no GC-allocated colors
 * in the hot path (all Three.js Color objects are pre-allocated in a ref).
 */
export const TempleLighting: React.FC = () => {
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)
  const timeOfDay    = useExperienceStore((s) => s.timeOfDay)
  const { scene }    = useThree()

  const sunLightRef  = useRef<THREE.DirectionalLight | null>(null)
  const skyFillRef   = useRef<THREE.DirectionalLight | null>(null)
  const rimLightRef  = useRef<THREE.DirectionalLight | null>(null)
  const hemiLightRef = useRef<THREE.HemisphereLight  | null>(null)

  /** 0 = full day, 1 = full night */
  const nightPhase = useRef(0)

  // ---------- pre-allocated palette (zero GC in render loop) ----------
  const pal = useRef({
    // Day
    dayHemiSky:    new THREE.Color('#ffe4cb'),
    dayHemiGround: new THREE.Color('#422f22'),
    daySun:        new THREE.Color('#fff1d6'),
    dayFill:       new THREE.Color('#b0c8e8'),
    dayRim:        new THREE.Color('#ffe299'),
    dayFog:        new THREE.Color('#251b14'),
    // Night
    nightHemiSky:    new THREE.Color('#0d1228'),
    nightHemiGround: new THREE.Color('#050810'),
    nightMoon:       new THREE.Color('#c8d8ff'),
    nightFill:       new THREE.Color('#18204a'),
    nightRim:        new THREE.Color('#7090cc'),
    nightFog:        new THREE.Color('#040810'),
    // Scratch (re-used every frame, never heap-allocated in loop)
    tmp:  new THREE.Color(),
    tmp2: new THREE.Color(),
  })

  // Sun & Moon world-space directions (used to animate the light position)
  const sunDir  = useRef(new THREE.Vector3(65, 75, 45))
  const moonDir = useRef(new THREE.Vector3(-55, 65, 35))
  const lerpPos = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    // Graceful ~3-4 s transition
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.28 * delta)
    const n = nightPhase.current
    const p = Math.min(1.0, Math.max(0, sceneProgress))
    const c = pal.current

    // --- hemisphere ------------------------------------------------
    if (hemiLightRef.current) {
      c.tmp.copy(c.dayHemiSky).lerp(c.nightHemiSky, n)
      c.tmp2.copy(c.dayHemiGround).lerp(c.nightHemiGround, n)
      hemiLightRef.current.color.copy(c.tmp)
      hemiLightRef.current.groundColor.copy(c.tmp2)
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(1.2, 0.18, n)
    }

    // --- primary directional (sun → moon) --------------------------
    if (sunLightRef.current) {
      lerpPos.current.lerpVectors(sunDir.current, moonDir.current, n)
      sunLightRef.current.position.copy(lerpPos.current)
      c.tmp.copy(c.daySun).lerp(c.nightMoon, n)
      sunLightRef.current.color.copy(c.tmp)
      const dayI = 2.8 + p * 1.2
      sunLightRef.current.intensity = THREE.MathUtils.lerp(dayI, 1.4, n)
    }

    // --- sky fill --------------------------------------------------
    if (skyFillRef.current) {
      c.tmp.copy(c.dayFill).lerp(c.nightFill, n)
      skyFillRef.current.color.copy(c.tmp)
      skyFillRef.current.intensity = THREE.MathUtils.lerp(0.9 + p * 0.4, 0.10, n)
    }

    // --- rim / silhouette -----------------------------------------
    if (rimLightRef.current) {
      c.tmp.copy(c.dayRim).lerp(c.nightRim, n)
      rimLightRef.current.color.copy(c.tmp)
      const dayRimI = 1.8 + Math.sin(p * Math.PI) * 0.8
      rimLightRef.current.intensity = THREE.MathUtils.lerp(dayRimI, 1.0, n)
    }

    // --- scene fog -------------------------------------------------
    if (scene.fog) {
      const fog = scene.fog as THREE.FogExp2
      c.tmp.copy(c.dayFog).lerp(c.nightFog, n)
      fog.color.copy(c.tmp)
      fog.density = THREE.MathUtils.lerp(0.0032, 0.0040, n)
    }
  })

  return (
    <>
      {/* 1. Atmospheric Hemisphere */}
      <hemisphereLight ref={hemiLightRef} args={['#ffe4cb', '#422f22', 1.2]} />

      {/* 2. Primary Sun / Moon Directional (shadow-casting) */}
      <directionalLight
        ref={sunLightRef}
        position={[65, 75, 45]}
        intensity={3.2}
        color="#fff1d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={320}
        shadow-camera-left={-85}
        shadow-camera-right={85}
        shadow-camera-top={90}
        shadow-camera-bottom={-85}
        shadow-bias={-0.0004}
      />

      {/* 3. Soft Sky Blue / Indigo Fill */}
      <directionalLight ref={skyFillRef} position={[-60, 45, -40]} intensity={1.1} color="#b0c8e8" />

      {/* 4. Golden / Silver Rim on Sri Vimana silhouette */}
      <directionalLight ref={rimLightRef} position={[-20, 80, -75]} intensity={2.2} color="#ffe299" />

      {/* 5. Front Warm Gopuram Key Light */}
      <directionalLight position={[15, 30, 95]} intensity={1.2} color="#ffd8a8" />

      {/* 6. Sacred Nandi Mandapam Deepam Lamps */}
      <pointLight position={[0,    6.2, 64]}   intensity={5.5} color="#ffc470" distance={22} decay={1.5} />
      <pointLight position={[-4.5, 4.8, 62.5]} intensity={3.8} color="#ffe2a0" distance={18} decay={1.6} />
      <pointLight position={[2.0,  4.8, 68.5]} intensity={2.8} color="#ffd285" distance={16} decay={1.6} />

      {/* 7. Gopuram Entrance Facade Warm Fill */}
      <directionalLight position={[0, 25, 175]} intensity={1.8} color="#ffe6b8" />

      {/* 8. Garbhagriha Sacred Aarti & Deepam on Maha Lingam */}
      <pointLight position={[0,    7.8, -23.5]} intensity={6.5} color="#ffa84e" distance={24} decay={1.5} />
      <pointLight position={[-2.4, 6.8, -23.0]} intensity={3.8} color="#ffd27a" distance={14} decay={1.6} />
      <pointLight position={[2.4,  6.8, -23.0]} intensity={3.8} color="#ffd27a" distance={14} decay={1.6} />

      {/* 9. Atmospheric Fog (color + density driven by useFrame above) */}
      <fogExp2 attach="fog" args={['#251b14', 0.0032]} />
    </>
  )
}

export default TempleLighting
