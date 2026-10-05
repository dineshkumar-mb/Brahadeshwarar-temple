import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TempleCamera } from './TempleCamera'
import { TempleLighting } from './TempleLighting'
import { TempleParticles } from './TempleParticles'
import { TempleModel } from './TempleModel'
import { TempleHotspots } from './TempleHotspots'
import { Kodimaram } from './Kodimaram'
import { TempleInscriptionsWall } from './TempleInscriptionsWall'
import { TempleDevotees } from './TempleDevotees'
import { useExperienceStore } from '../../state/experienceStore'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers – Canvas texture factories (run once at mount, zero GC in render loop)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Photorealistic Day Sky Texture (Rayleigh Scattering)
 * Equirectangular mapping: y=0 is Zenith, y=256 (0.50) is Horizon, y=512 (1.0) is Nadir.
 */
function buildDaySkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Natural Rayleigh atmospheric gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0.00, '#134988') // Deep morning azure zenith
  grad.addColorStop(0.20, '#2d72b5') // Upper morning sky blue
  grad.addColorStop(0.38, '#619fd2') // Cerulean sky
  grad.addColorStop(0.47, '#96c3e7') // Soft azure morning atmosphere
  grad.addColorStop(0.50, '#dceaf6') // Luminous horizon light
  grad.addColorStop(0.52, '#edd9bf') // Sun-warmed golden horizon dust band
  grad.addColorStop(0.56, '#6b5442') // Horizon ground transition
  grad.addColorStop(0.75, '#382a1e') // Lower ground hemisphere
  grad.addColorStop(1.00, '#241a12') // Nadir
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 512)

  // Soft atmospheric warm haze band near the horizon
  const hz = ctx.createLinearGradient(0, 210, 0, 280)
  hz.addColorStop(0.0, 'rgba(255, 235, 195, 0.0)')
  hz.addColorStop(0.5, 'rgba(255, 220, 160, 0.14)')
  hz.addColorStop(1.0, 'rgba(210, 165, 110, 0.08)')
  ctx.fillStyle = hz
  ctx.fillRect(0, 210, 1024, 70)

  const tex = new THREE.CanvasTexture(canvas)
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

/**
 * Photorealistic Night Sky Texture (Deep Cosmic Atmosphere, Starfield & Milky Way)
 */
function buildNightSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Deep cosmic night sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0.00, '#01030a') // Inky cosmic zenith
  grad.addColorStop(0.25, '#040918') // Deep stellar indigo
  grad.addColorStop(0.42, '#081228') // Atmospheric midnight blue
  grad.addColorStop(0.48, '#0d1a38') // Soft airglow layer
  grad.addColorStop(0.50, '#121e3d') // Horizon silhouette
  grad.addColorStop(0.53, '#070c18') // Ground boundary
  grad.addColorStop(1.00, '#020306') // Nadir
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 512)

  // Realistic Astronomical Starfield (Magnitude & Spectral Distribution)
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 250 // Upper celestial hemisphere
    const mag = Math.random()
    const r = mag > 0.98 ? Math.random() * 1.5 + 1.2 : mag > 0.88 ? Math.random() * 0.9 + 0.6 : Math.random() * 0.5 + 0.25
    const a = mag > 0.95 ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.25

    let col = '255,255,255'
    if (i % 7 === 0) col = '190,220,255'      // Hot blue-white O/B
    else if (i % 9 === 0) col = '255,235,190' // Warm yellow-white F/G
    else if (i % 23 === 0) col = '255,190,150' // Orange giant K/M

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${col},${a})`
    ctx.fill()
  }

  // Sacred Krittika / Pleiades Asterism (distinct open star cluster)
  const px = 430
  const py = 75
  const pleiades = [
    [0, 0], [4, -3], [8, -1], [11, 4], [7, 6], [-4, 3], [-8, 1]
  ]
  pleiades.forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.arc(px + dx * 2.2, py + dy * 2.2, 1.4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(215, 235, 255, 0.95)'
    ctx.fill()
  })

  // Milky Way Band (Akashaganga) – soft luminous celestial dust ribbon
  const mw = ctx.createLinearGradient(0, 30, 1024, 320)
  mw.addColorStop(0.00, 'rgba(110, 130, 205, 0.0)')
  mw.addColorStop(0.20, 'rgba(120, 140, 215, 0.03)')
  mw.addColorStop(0.45, 'rgba(145, 165, 240, 0.065)')
  mw.addColorStop(0.60, 'rgba(155, 175, 245, 0.08)')
  mw.addColorStop(0.78, 'rgba(125, 145, 220, 0.035)')
  mw.addColorStop(1.00, 'rgba(110, 130, 205, 0.0)')
  ctx.fillStyle = mw
  ctx.fillRect(0, 0, 1024, 512)

  // Soft nocturnal horizon airglow
  const hg = ctx.createLinearGradient(0, 230, 0, 280)
  hg.addColorStop(0.0, 'rgba(30, 50, 105, 0.0)')
  hg.addColorStop(0.5, 'rgba(40, 65, 130, 0.09)')
  hg.addColorStop(1.0, 'rgba(20, 35, 75, 0.04)')
  ctx.fillStyle = hg
  ctx.fillRect(0, 230, 1024, 50)

  const tex = new THREE.CanvasTexture(canvas)
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

/**
 * Procedural Lunar Surface Map (Authentic Lunar Maria & Crater Rays)
 */
function buildMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Base silvery-white highland regolith
  ctx.fillStyle = '#e4edf7'
  ctx.fillRect(0, 0, 512, 256)

  // Subtle cratered highland texture
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    const r = Math.random() * 2.2 + 0.5
    const shade = Math.floor(Math.random() * 28 + 205)
    ctx.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Major Basaltic Lunar Maria (Oceanus Procellarum, Mare Tranquillitatis, etc.)
  const maria = [
    { x: 170, y: 110, r: 65, color: 'rgba(125, 140, 160, 0.45)' },
    { x: 215, y: 85,  r: 45, color: 'rgba(115, 130, 150, 0.50)' },
    { x: 280, y: 90,  r: 38, color: 'rgba(120, 135, 155, 0.48)' },
    { x: 310, y: 125, r: 35, color: 'rgba(110, 125, 145, 0.52)' },
    { x: 375, y: 115, r: 24, color: 'rgba(105, 120, 140, 0.55)' },
    { x: 345, y: 160, r: 30, color: 'rgba(115, 130, 150, 0.42)' },
    { x: 245, y: 155, r: 35, color: 'rgba(125, 140, 160, 0.38)' },
    { x: 190, y: 175, r: 28, color: 'rgba(120, 135, 155, 0.35)' },
  ]

  maria.forEach((m) => {
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r)
    g.addColorStop(0.0, m.color)
    g.addColorStop(0.65, m.color.replace('0.', '0.2'))
    g.addColorStop(1.0, 'transparent')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // Tycho Crater & Bright Ejecta Rays (Southern Highlands)
  const tychoX = 265
  const tychoY = 195
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.lineWidth = 1.2
  for (let a = 0; a < 16; a++) {
    const angle = (a / 16) * Math.PI * 2 + 0.1
    const len = 70 + Math.random() * 90
    ctx.beginPath()
    ctx.moveTo(tychoX, tychoY)
    ctx.lineTo(tychoX + Math.cos(angle) * len, tychoY + Math.sin(angle) * len)
    ctx.stroke()
  }
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(tychoX, tychoY, 3.5, 0, Math.PI * 2)
  ctx.fill()

  // Copernicus & Kepler Craters
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.beginPath()
  ctx.arc(205, 125, 4.0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(155, 128, 2.5, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ─────────────────────────────────────────────────────────────────────────────
// DynamicSkyDome – cross-fades between the day and night textures
// ─────────────────────────────────────────────────────────────────────────────
const DynamicSkyDome: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  const [daySphere] = useState<THREE.Mesh>(() => {
    const geo = new THREE.SphereGeometry(350, 32, 24)
    const mat = new THREE.MeshBasicMaterial({
      map: buildDaySkyTexture(),
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 1,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.scale.set(-1, 1, 1)
    mesh.rotation.set(0, -Math.PI / 4, 0)
    mesh.renderOrder = -2
    return mesh
  })

  const [nightSphere] = useState<THREE.Mesh>(() => {
    const geo = new THREE.SphereGeometry(340, 32, 24)
    const mat = new THREE.MeshBasicMaterial({
      map: buildNightSkyTexture(),
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 0,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.scale.set(-1, 1, 1)
    mesh.rotation.set(0, -Math.PI / 4, 0)
    mesh.renderOrder = -1
    return mesh
  })

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.32 * delta)
    const n = nightPhase.current
    ;(daySphere.material   as THREE.MeshBasicMaterial).opacity = 1 - n
    ;(nightSphere.material as THREE.MeshBasicMaterial).opacity = n
  })

  return (
    <>
      <primitive object={daySphere}  />
      <primitive object={nightSphere}/>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StarField3D – Three.js Points cloud with spectral colors, fades in at night
// ─────────────────────────────────────────────────────────────────────────────
const StarField3D: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  const [stars] = useState<THREE.Points>(() => {
    const count = 1500
    const pos = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const col = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 285 + Math.random() * 18
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 6 // upper hemisphere only
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      if (i % 8 === 0) col.set('#c8deff')      // cool blue-white
      else if (i % 11 === 0) col.set('#ffeed2') // warm golden
      else if (i % 29 === 0) col.set('#ffd2aa') // red-orange giant
      else col.set('#ffffff')                  // pure white

      colors[i * 3]     = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      sizeAttenuation: false,
    })
    return new THREE.Points(geo, mat)
  })

  useFrame(({ clock }, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.32 * delta)
    const t = clock.getElapsedTime()
    const twinkle = 0.92 + Math.sin(t * 2.8) * 0.08
    ;(stars.material as THREE.PointsMaterial).opacity = nightPhase.current * twinkle
  })

  return <primitive object={stars} />
}

// ─────────────────────────────────────────────────────────────────────────────
// CelestialBody – Photorealistic Sun (Day) & Textured Silvery Moon (Night)
// ─────────────────────────────────────────────────────────────────────────────
const CelestialBody: React.FC = () => {
  const timeOfDay  = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  const SKY_R = 275

  // Directional vectors matching TempleLighting (tropical solar noon elevation & silvery moon)
  const sunDir  = useMemo(() => new THREE.Vector3( 12,  88, 14).normalize(), [])
  const moonDir = useMemo(() => new THREE.Vector3(-12,  84, 16).normalize(), [])

  const sunPos  = useMemo(() => sunDir.clone().multiplyScalar(SKY_R), [sunDir])
  const moonPos = useMemo(() => moonDir.clone().multiplyScalar(SKY_R), [moonDir])

  // ── SUN COMPONENTS ──
  // 1. Core solar disk (white-hot)
  const [sunDisk] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
    )
    m.position.copy(sunPos)
    m.scale.setScalar(12)
    return m
  })

  // 2. Inner golden solar corona
  const [sunCorona] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xfff4d2,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    )
    m.position.copy(sunPos)
    m.scale.setScalar(26)
    return m
  })

  // 3. Outer solar flare glow
  const [sunGlow] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffd280,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
    )
    m.position.copy(sunPos)
    m.scale.setScalar(62)
    return m
  })

  // 4. Far Rayleigh atmospheric scatter
  const [sunScatter] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffb250,
        transparent: true,
        opacity: 0.035,
        depthWrite: false,
      })
    )
    m.position.copy(sunPos)
    m.scale.setScalar(120)
    return m
  })

  // ── MOON COMPONENTS ──
  // 1. Textured lunar disk
  const [moonDisk] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 20),
      new THREE.MeshBasicMaterial({
        map: buildMoonTexture(),
        transparent: true,
        opacity: 0,
      })
    )
    m.position.copy(moonPos)
    m.scale.setScalar(8.5)
    return m
  })

  // 2. Inner silvery lunar glow
  const [moonGlow] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xd8e8fc,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    )
    m.position.copy(moonPos)
    m.scale.setScalar(18)
    return m
  })

  // 3. Outer atmospheric silver moon halo
  const [moonHalo] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0x8ab6ee,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    )
    m.position.copy(moonPos)
    m.scale.setScalar(42)
    return m
  })

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.32 * delta)
    const n = nightPhase.current
    const dayAlpha = 1 - n

    // Sun elements fade out smoothly
    ;(sunDisk.material    as THREE.MeshBasicMaterial).opacity = dayAlpha
    ;(sunCorona.material  as THREE.MeshBasicMaterial).opacity = dayAlpha * 0.35
    ;(sunGlow.material    as THREE.MeshBasicMaterial).opacity = dayAlpha * 0.12
    ;(sunScatter.material as THREE.MeshBasicMaterial).opacity = dayAlpha * 0.035

    // Moon elements fade in smoothly
    ;(moonDisk.material as THREE.MeshBasicMaterial).opacity = n
    ;(moonGlow.material as THREE.MeshBasicMaterial).opacity = n * 0.18
    ;(moonHalo.material as THREE.MeshBasicMaterial).opacity = n * 0.05
  })

  return (
    <>
      {/* Sun System */}
      <primitive object={sunDisk}    />
      <primitive object={sunCorona}  />
      <primitive object={sunGlow}    />
      <primitive object={sunScatter} />

      {/* Moon System */}
      <primitive object={moonDisk}   />
      <primitive object={moonGlow}   />
      <primitive object={moonHalo}   />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Realistic Stone Courtyard Ground
// ─────────────────────────────────────────────────────────────────────────────
const RealisticCourtyardGround: React.FC = () => {
  const groundTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#6b533e'
    ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = '#4a3726'
    ctx.lineWidth = 3
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke()
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
    }
    for (let i = 0; i < 20000; i++) {
      const px = Math.random() * 512
      const py = Math.random() * 512
      const s  = Math.random() * 2 + 1
      ctx.fillStyle =
        Math.random() > 0.5
          ? 'rgba(160,125,90,0.25)'
          : 'rgba(50,35,20,0.3)'
      ctx.fillRect(px, py, s, s)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(28, 28)
    return tex
  }, [])

  // Architectural Wonder of Brihadisvara Temple:
  // The shadow of the monumental 66m Sri Vimana / Sikhara never falls on the open courtyard ground.
  // The courtyard ground plane explicitly does NOT receive shadows, ensuring the Vimana's shadow
  // remains exclusively self-contained within its own stepped pyramidal tiers and Upapitha base.
  return (
    <mesh receiveShadow={false} position={[0, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[360, 380]} />
      <meshStandardMaterial color="#705842" map={groundTex} roughness={0.9} metalness={0.02} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TempleScene – main export
// ─────────────────────────────────────────────────────────────────────────────
export const TempleScene: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true)
  const setWebglFailed = useExperienceStore((s) => s.setWebglFailed)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) { setHasWebGL(false); setWebglFailed(true) }
    } catch {
      setHasWebGL(false); setWebglFailed(true)
    }
  }, [setWebglFailed])

  if (!hasWebGL) return null

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a1020]">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 3.8, 168], fov: 46, near: 0.1, far: 500 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.setClearColor('#c6d8ec')
        }}
      >
        <Suspense fallback={null}>
          <DynamicSkyDome />
          <CelestialBody />
          <StarField3D />
          <TempleLighting />
          <RealisticCourtyardGround />
          <TempleParticles />
          <TempleModel />
          <TempleInscriptionsWall />
          <TempleDevotees />
          <Kodimaram />
          <TempleHotspots />
          <TempleCamera />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default TempleScene
