import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TempleCamera } from './TempleCamera'
import { TempleLighting } from './TempleLighting'
import { TempleParticles } from './TempleParticles'
import { TempleModel } from './TempleModel'
import { TempleHotspots } from './TempleHotspots'
import { Kodimaram } from './Kodimaram'
import { useExperienceStore } from '../../state/experienceStore'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers – canvas texture factories (run once at mount, no GC in render loop)
// ─────────────────────────────────────────────────────────────────────────────
function buildDaySkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0,    '#1e304a')   // Deep zenith blue
  grad.addColorStop(0.30, '#4a5978')   // Upper morning blue
  grad.addColorStop(0.55, '#9e7156')   // Warm dawn band
  grad.addColorStop(0.78, '#dca068')   // Golden horizon
  grad.addColorStop(1.0,  '#3a2517')   // Ground line
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Sun radiance – lower-right quadrant (matches light at [65,75,45])
  const sg = ctx.createRadialGradient(390, 430, 8, 390, 430, 170)
  sg.addColorStop(0,   'rgba(255,252,220,1.0)')
  sg.addColorStop(0.06,'rgba(255,245,190,0.95)')
  sg.addColorStop(0.25,'rgba(255,215,130,0.55)')
  sg.addColorStop(0.60,'rgba(240,175, 80,0.18)')
  sg.addColorStop(1,   'rgba(230,155, 60,0)')
  ctx.fillStyle = sg
  ctx.fillRect(0, 0, 512, 512)

  // Warm scatter haze near horizon
  const hz = ctx.createLinearGradient(0, 340, 0, 512)
  hz.addColorStop(0,   'rgba(255,195,90,0)')
  hz.addColorStop(0.5, 'rgba(255,175,60,0.12)')
  hz.addColorStop(1,   'rgba(180,100,30,0.20)')
  ctx.fillStyle = hz
  ctx.fillRect(0, 0, 512, 512)

  const tex = new THREE.CanvasTexture(canvas)
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

function buildNightSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Deep night gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0,    '#020510')
  grad.addColorStop(0.40, '#080e22')
  grad.addColorStop(0.70, '#0e1630')
  grad.addColorStop(0.88, '#14102a')
  grad.addColorStop(1.0,  '#080510')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Stars – scattered across upper hemisphere
  for (let i = 0; i < 700; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 360          // mostly upper sky
    const r = Math.random() * 1.6 + 0.3
    const a = (Math.random() * 0.7 + 0.3)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${a})`
    ctx.fill()
  }

  // Milky way band – faint diagonal glow
  const mw = ctx.createLinearGradient(0, 50, 512, 350)
  mw.addColorStop(0,    'rgba(110,125,195,0)')
  mw.addColorStop(0.25, 'rgba(110,125,210,0.04)')
  mw.addColorStop(0.5,  'rgba(130,145,230,0.07)')
  mw.addColorStop(0.75, 'rgba(110,125,195,0.04)')
  mw.addColorStop(1,    'rgba(110,125,195,0)')
  ctx.fillStyle = mw
  ctx.fillRect(0, 0, 512, 512)

  // Moon glow – upper left (matches light at [-55,65,35])
  const mg = ctx.createRadialGradient(105, 90, 10, 105, 90, 130)
  mg.addColorStop(0,    'rgba(235,248,255,1.0)')
  mg.addColorStop(0.08, 'rgba(210,235,255,0.95)')
  mg.addColorStop(0.20, 'rgba(175,210,255,0.55)')
  mg.addColorStop(0.45, 'rgba(130,175,255,0.22)')
  mg.addColorStop(0.75, 'rgba( 90,140,230,0.06)')
  mg.addColorStop(1,    'rgba( 60,110,210,0)')
  ctx.fillStyle = mg
  ctx.fillRect(0, 0, 512, 512)

  // Horizon twilight glow (faint blue-violet band)
  const hg = ctx.createLinearGradient(0, 370, 0, 512)
  hg.addColorStop(0,   'rgba(60,80,160,0)')
  hg.addColorStop(0.5, 'rgba(50,70,140,0.08)')
  hg.addColorStop(1,   'rgba(30,50,110,0.15)')
  ctx.fillStyle = hg
  ctx.fillRect(0, 0, 512, 512)

  const tex = new THREE.CanvasTexture(canvas)
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

// ─────────────────────────────────────────────────────────────────────────────
// DynamicSkyDome – cross-fades between the day and night textures
// ─────────────────────────────────────────────────────────────────────────────
const DynamicSkyDome: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  // Build both sphere objects imperatively once (avoids JSX recreation)
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
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.28 * delta)
    const n = nightPhase.current
    ;(daySphere.material  as THREE.MeshBasicMaterial).opacity = 1 - n
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
// StarField3D – Three.js Points cloud, fades in at night
// ─────────────────────────────────────────────────────────────────────────────
const StarField3D: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  const [stars] = useState<THREE.Points>(() => {
    const count = 1400
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 285 + Math.random() * 18
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 8   // upper hemisphere only
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      size: 1.1,
      color: 0xd8e8ff,
      transparent: true,
      opacity: 0,
      sizeAttenuation: false,
    })
    return new THREE.Points(geo, mat)
  })

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.28 * delta)
    ;(stars.material as THREE.PointsMaterial).opacity = nightPhase.current
  })

  return <primitive object={stars} />
}

// ─────────────────────────────────────────────────────────────────────────────
// CelestialBody – Sun disk (day) ↔ Moon disk (night) that slides across sky
// ─────────────────────────────────────────────────────────────────────────────
const CelestialBody: React.FC = () => {
  const timeOfDay  = useExperienceStore((s) => s.timeOfDay)
  const nightPhase = useRef(0)

  const SKY_R = 272

  // Directional vectors (match the TempleLighting positions)
  const sunDir  = useMemo(() => new THREE.Vector3( 65,  75, 45).normalize(), [])
  const moonDir = useMemo(() => new THREE.Vector3(-55,  65, 35).normalize(), [])
  const lerpDir = useRef(new THREE.Vector3())

  // Pre-allocated palette
  const pal = useRef({
    sunDisk:  new THREE.Color('#fffcdc'),
    moonDisk: new THREE.Color('#d8eeff'),
    sunGlow:  new THREE.Color('#ffdc80'),
    moonGlow: new THREE.Color('#7aabee'),
    tmp: new THREE.Color(),
  })

  const initPos = useMemo(
    () => sunDir.clone().multiplyScalar(SKY_R),
    [sunDir]
  )

  // Create disk + corona/glow meshes imperatively
  const [disk]  = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xfffcdc })
    )
    m.position.copy(initPos)
    m.scale.setScalar(15)
    return m
  })

  const [glow] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshBasicMaterial({
        color: 0xffdc80,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      })
    )
    m.position.copy(initPos)
    m.scale.setScalar(46)
    return m
  })

  // Extra outer corona ring for sun
  const [corona] = useState<THREE.Mesh>(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffaa30,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      })
    )
    m.position.copy(initPos)
    m.scale.setScalar(90)
    return m
  })

  useFrame((_, delta) => {
    const target = timeOfDay === 'night' ? 1.0 : 0.0
    nightPhase.current += (target - nightPhase.current) * Math.min(1, 0.28 * delta)
    const n = nightPhase.current
    const c = pal.current

    // Lerp position direction → scale to sky radius
    lerpDir.current.lerpVectors(sunDir, moonDir, n).normalize()
    const newPos = lerpDir.current.multiplyScalar(SKY_R)

    disk.position.copy(newPos)
    glow.position.copy(newPos)
    corona.position.copy(newPos)

    // Disk color & size
    c.tmp.copy(c.sunDisk).lerp(c.moonDisk, n)
    ;(disk.material as THREE.MeshBasicMaterial).color.copy(c.tmp)
    disk.scale.setScalar(THREE.MathUtils.lerp(15, 9, n))   // Sun larger

    // Glow (corona) color & opacity
    c.tmp.copy(c.sunGlow).lerp(c.moonGlow, n)
    ;(glow.material as THREE.MeshBasicMaterial).color.copy(c.tmp)
    ;(glow.material as THREE.MeshBasicMaterial).opacity =
      THREE.MathUtils.lerp(0.18, 0.09, n)
    glow.scale.setScalar(THREE.MathUtils.lerp(46, 30, n))

    // Outer corona – day only
    ;(corona.material as THREE.MeshBasicMaterial).opacity =
      THREE.MathUtils.lerp(0.06, 0.0, n)
    corona.scale.setScalar(THREE.MathUtils.lerp(90, 55, n))
  })

  return (
    <>
      <primitive object={disk}   />
      <primitive object={glow}   />
      <primitive object={corona} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Realistic Stone Courtyard Ground (unchanged)
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

  return (
    <mesh receiveShadow position={[0, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]}>
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#181310]">
      <Canvas
        shadows
        camera={{ position: [0, 3.8, 168], fov: 46, near: 0.1, far: 500 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#251b14')
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
          <Kodimaram />
          <TempleHotspots />
          <TempleCamera />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default TempleScene
