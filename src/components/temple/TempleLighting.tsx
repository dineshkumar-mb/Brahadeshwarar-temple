import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * Photorealistic Heritage Lighting for Brihadisvara Temple
 *
 * Implements physically plausible day ↔ night solar/lunar illumination:
 *
 * DAY (Golden Chola Morning Sunlight):
 *   - Direct Sun: Luminous 5400K warm white (#fff7ec) casting crisp architectural shadows.
 *   - Rayleigh Sky Ambient: Cool atmospheric blue (#78a6de) on upward surfaces,
 *     warm granite earth bounce (#3d2e22) on downward surfaces.
 *   - Diffuse Sky Fill: Subtle cerulean fill (#8ab3e2) preventing pitch-black shadows.
 *   - Vimana Rim: Soft golden rim (#ffe7cc) highlighting the 80-tonne granite Sikhara.
 *   - Atmospheric Aerial Perspective: Luminous sun-warmed morning haze (#c6d8ec).
 *
 * NIGHT (Natural Silvery Moonlight & Sacred Deepams):
 *   - Silvery Moonlight: Reflected lunar spectrum (#dce8f8) calibrated to mesopic/Purkinje
 *     human vision — delicate, cool silvery-white rather than unnatural cartoon cyan.
 *   - Subtle Silvery Shadows: Moon directional light (0.42 intensity) provides authentic
 *     nighttime contrast without washing out the sky or temple textures.
 *   - Cosmic Indigo Ambient: Deep night sky hemisphere (#0a1228 / #03050a).
 *   - Sacred Living Deepams: Nandi Mandapam & Garbhagriha oil lamps (2100K warm amber)
 *     glow with dynamic organic micro-flicker against the cool granite walls.
 *   - Nocturnal Haze: Deep indigo atmospheric mist (#060b18).
 *
 * Dynamic camera exposure automatically adapts between day (1.05) and night (1.18).
 */
export const TempleLighting: React.FC = () => {
  const sceneProgress = useExperienceStore((s) => s.sceneProgress)
  const timeOfDay    = useExperienceStore((s) => s.timeOfDay)
  const { scene, gl } = useThree()

  // Directional & Ambient Lights
  const sunLightRef    = useRef<THREE.DirectionalLight | null>(null)
  const skyFillRef     = useRef<THREE.DirectionalLight | null>(null)
  const rimLightRef    = useRef<THREE.DirectionalLight | null>(null)
  const hemiLightRef   = useRef<THREE.HemisphereLight  | null>(null)
  const gopuramKeyRef  = useRef<THREE.DirectionalLight | null>(null)
  const gopuramFillRef = useRef<THREE.DirectionalLight | null>(null)

  // Sacred Deepam & Aarti Point Lights (Living Oil Lamps)
  const deepamNandi1   = useRef<THREE.PointLight | null>(null)
  const deepamNandi2   = useRef<THREE.PointLight | null>(null)
  const deepamNandi3   = useRef<THREE.PointLight | null>(null)
  const aartiLingam    = useRef<THREE.PointLight | null>(null)
  const deepamSanctum1 = useRef<THREE.PointLight | null>(null)
  const deepamSanctum2 = useRef<THREE.PointLight | null>(null)

  /** 0 = full day, 1 = full night */
  const nightPhase = useRef(0)

  // ---------- Pre-allocated palette (zero GC in render loop) ----------
  const pal = useRef({
    // Day — Natural Tropical Morning Sun & Rayleigh Skylight
    dayHemiSky:    new THREE.Color('#78a6de'),
    dayHemiGround: new THREE.Color('#3d2e22'),
    daySun:        new THREE.Color('#fff7ec'),
    dayFill:       new THREE.Color('#8ab3e2'),
    dayRim:        new THREE.Color('#ffe7cc'),
    dayFog:        new THREE.Color('#c6d8ec'),
    // Night — Silvery Moonshine & Deep Nocturnal Indigo
    nightHemiSky:    new THREE.Color('#0a1228'),
    nightHemiGround: new THREE.Color('#03050a'),
    nightMoon:       new THREE.Color('#dce8f8'),
    nightFill:       new THREE.Color('#0c1630'),
    nightRim:        new THREE.Color('#94aed8'),
    nightFog:        new THREE.Color('#060b18'),
    // Scratch (re-used every frame, zero heap allocation)
    tmp:  new THREE.Color(),
    tmp2: new THREE.Color(),
  })

  // Sun & Moon celestial directions (matched with 3D CelestialBody)
  // Calibrated to Thanjavur's tropical solar noon (~82° elevation),
  // ensuring the Vimana's conical shadow falls directly within its own Upapitha base plinth
  const sunDir  = useRef(new THREE.Vector3(12, 88, 14))
  const moonDir = useRef(new THREE.Vector3(-12, 84, 16))
  const lerpPos = useRef(new THREE.Vector3())

  useFrame(({ clock }, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    // Smooth, cinematic ~3 second solar/lunar transition
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.32 * delta)
    const n = nightPhase.current
    const p = Math.min(1.0, Math.max(0, sceneProgress))
    const c = pal.current
    const t = clock.getElapsedTime()

    // --- 1. Hemisphere Light (Sky dome vs Ground bounce) -----------
    if (hemiLightRef.current) {
      c.tmp.copy(c.dayHemiSky).lerp(c.nightHemiSky, n)
      c.tmp2.copy(c.dayHemiGround).lerp(c.nightHemiGround, n)
      hemiLightRef.current.color.copy(c.tmp)
      hemiLightRef.current.groundColor.copy(c.tmp2)
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(0.85, 0.14, n)
    }

    // --- 2. Primary Directional (Sun ↔ Moon with shadows) ----------
    if (sunLightRef.current) {
      lerpPos.current.lerpVectors(sunDir.current, moonDir.current, n)
      sunLightRef.current.position.copy(lerpPos.current)
      c.tmp.copy(c.daySun).lerp(c.nightMoon, n)
      sunLightRef.current.color.copy(c.tmp)
      const dayI = 2.4 + p * 0.35
      // Moon directional intensity is 0.42: delicate silver key light, NOT washed-out day!
      sunLightRef.current.intensity = THREE.MathUtils.lerp(dayI, 0.42, n)
    }

    // --- 3. Diffuse Sky Fill ---------------------------------------
    if (skyFillRef.current) {
      c.tmp.copy(c.dayFill).lerp(c.nightFill, n)
      skyFillRef.current.color.copy(c.tmp)
      skyFillRef.current.intensity = THREE.MathUtils.lerp(0.35 + p * 0.1, 0.06, n)
    }

    // --- 4. Architectural Vimana Rim Light -------------------------
    if (rimLightRef.current) {
      c.tmp.copy(c.dayRim).lerp(c.nightRim, n)
      rimLightRef.current.color.copy(c.tmp)
      rimLightRef.current.intensity = THREE.MathUtils.lerp(0.65, 0.32, n)
    }

    // --- 5. Gopuram Entrance Facade Lights (Dim to zero at night) ---
    if (gopuramKeyRef.current) {
      gopuramKeyRef.current.intensity = THREE.MathUtils.lerp(0.55, 0.02, n)
    }
    if (gopuramFillRef.current) {
      gopuramFillRef.current.intensity = THREE.MathUtils.lerp(0.45, 0.0, n)
    }

    // --- 6. Living Sacred Deepam Oil Lamps (Organic micro-flicker) -
    const flk1 = 1.0 + Math.sin(t * 11.2) * 0.07 + Math.sin(t * 23.4) * 0.04 + Math.cos(t * 7.1) * 0.05
    const flk2 = 1.0 + Math.sin(t * 9.8 + 1.2) * 0.06 + Math.sin(t * 19.3) * 0.04 + Math.cos(t * 8.4) * 0.05
    const flk3 = 1.0 + Math.sin(t * 13.5 + 2.4) * 0.07 + Math.sin(t * 27.1) * 0.03 + Math.cos(t * 6.5) * 0.04
    const flkL = 1.0 + Math.sin(t * 10.5 + 0.8) * 0.08 + Math.sin(t * 22.1) * 0.05 + Math.cos(t * 5.9) * 0.06

    if (deepamNandi1.current)   deepamNandi1.current.intensity   = THREE.MathUtils.lerp(3.2, 6.2, n) * flk1
    if (deepamNandi2.current)   deepamNandi2.current.intensity   = THREE.MathUtils.lerp(2.2, 4.2, n) * flk2
    if (deepamNandi3.current)   deepamNandi3.current.intensity   = THREE.MathUtils.lerp(1.8, 3.4, n) * flk3
    if (aartiLingam.current)    aartiLingam.current.intensity    = THREE.MathUtils.lerp(4.5, 8.2, n) * flkL
    if (deepamSanctum1.current) deepamSanctum1.current.intensity = THREE.MathUtils.lerp(2.4, 4.8, n) * flk2
    if (deepamSanctum2.current) deepamSanctum2.current.intensity = THREE.MathUtils.lerp(2.4, 4.8, n) * flk3

    // --- 7. Atmospheric Fog & Screen Clear Color -------------------
    if (scene.fog) {
      const fog = scene.fog as THREE.FogExp2
      c.tmp.copy(c.dayFog).lerp(c.nightFog, n)
      fog.color.copy(c.tmp)
      fog.density = THREE.MathUtils.lerp(0.0022, 0.0034, n)
      gl.setClearColor(c.tmp)
    }

    // --- 8. Dynamic Physiological Eye Exposure Adaptation ---------
    gl.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.18, n)
  })

  return (
    <>
      {/* 1. Atmospheric Hemisphere Light (Rayleigh Blue Sky / Midnight Indigo ↔ Granite Earth) */}
      <hemisphereLight ref={hemiLightRef} args={['#78a6de', '#3d2e22', 0.85]} />

      {/* 2. Primary Sun / Moon Directional Light (High-Res Soft Contact Shadows) */}
      <directionalLight
        ref={sunLightRef}
        position={[12, 88, 14]}
        intensity={2.5}
        color="#fff7ec"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={320}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-bias={-0.0003}
        shadow-normalBias={0.035}
      />

      {/* 3. Soft Cerulean Sky Fill (Opposite Sun azimuth, prevents pitch-black shadows) */}
      <directionalLight ref={skyFillRef} position={[-50, 42, -35]} intensity={0.35} color="#8ab3e2" />

      {/* 4. Architectural Silhouette Rim Light (Catches 80-tonne granite dome & Kalasam) */}
      <directionalLight ref={rimLightRef} position={[-25, 75, -70]} intensity={0.65} color="#ffe7cc" />

      {/* 5. Front Gopuram Architectural Key Light (Dims to near-zero at night) */}
      <directionalLight ref={gopuramKeyRef} position={[15, 30, 95]} intensity={0.55} color="#ffdcb0" />

      {/* 6. Gopuram Entrance Portal Fill Light (Dims to zero at night) */}
      <directionalLight ref={gopuramFillRef} position={[0, 25, 175]} intensity={0.45} color="#ffe2ba" />

      {/* 7. Sacred Nandi Mandapam Deepam Oil Lamps (Warm amber glow with organic flicker) */}
      <pointLight ref={deepamNandi1} position={[0,    6.2, 64]}   intensity={3.2} color="#ffb255" distance={22} decay={2.0} />
      <pointLight ref={deepamNandi2} position={[-4.5, 4.8, 62.5]} intensity={2.2} color="#ffbe68" distance={18} decay={2.0} />
      <pointLight ref={deepamNandi3} position={[2.0,  4.8, 68.5]} intensity={1.8} color="#ffb65c" distance={16} decay={2.0} />

      {/* 8. Garbhagriha Sacred Aarti Flame & Deepams on Maha Lingam */}
      <pointLight ref={aartiLingam}    position={[0,    7.8, -23.5]} intensity={4.5} color="#ffa23d" distance={24} decay={2.0} />
      <pointLight ref={deepamSanctum1} position={[-2.4, 6.8, -23.0]} intensity={2.4} color="#ffb452" distance={16} decay={2.0} />
      <pointLight ref={deepamSanctum2} position={[2.4,  6.8, -23.0]} intensity={2.4} color="#ffb452" distance={16} decay={2.0} />

      {/* 9. Aerial Atmospheric Fog */}
      <fogExp2 attach="fog" args={['#c6d8ec', 0.0022]} />
    </>
  )
}

export default TempleLighting
