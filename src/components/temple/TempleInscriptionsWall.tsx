import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * 3D Royal Epigraphy & Inscription Wall Panel
 * Renders an authentic Chola-era granite plinth (Adhishthana) panel
 * carved with Emperor Rajaraja I's famous 1010 CE coronation Meikeerthi
 * and donation decrees in eleventh-century Tamil script.
 */
export const TempleInscriptionsWall: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const lampLightRef = useRef<THREE.PointLight | null>(null)
  const flameMeshRef = useRef<THREE.Mesh | null>(null)

  // 1. Procedural Inscription Texture with authentic Chola Meikeerthi script
  const { inscriptionTexture, bumpTexture } = useMemo(() => {
    // Albedo / Diffuse Canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Bump / Normal Relief Canvas
    const bCanvas = document.createElement('canvas')
    bCanvas.width = 1024
    bCanvas.height = 512
    const bCtx = bCanvas.getContext('2d')!

    // Base Weathered Thanjavur Granite
    const grad = ctx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0.0, '#a1744a')
    grad.addColorStop(0.3, '#b8895b')
    grad.addColorStop(0.7, '#9e7146')
    grad.addColorStop(1.0, '#855c36')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1024, 512)

    // Base bump: neutral grey
    bCtx.fillStyle = '#808080'
    bCtx.fillRect(0, 0, 1024, 512)

    // Authentic granite mineral flecks (quartz crystals & black biotite)
    for (let i = 0; i < 25000; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 512
      const s = Math.random() * 2 + 0.8
      const isDark = Math.random() > 0.45
      ctx.fillStyle = isDark ? 'rgba(40, 28, 18, 0.4)' : 'rgba(235, 205, 170, 0.35)'
      ctx.fillRect(x, y, s, s)

      const bVal = isDark ? 100 : 155
      bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`
      bCtx.fillRect(x, y, s, s)
    }

    // Horizontal architectural masonry joint lines
    const jointY = [60, 256, 450]
    jointY.forEach((y) => {
      ctx.fillStyle = 'rgba(30, 20, 12, 0.7)'
      ctx.fillRect(0, y - 2, 1024, 4)
      ctx.fillStyle = 'rgba(255, 230, 200, 0.15)'
      ctx.fillRect(0, y + 2, 1024, 1.5)

      bCtx.fillStyle = '#202020'
      bCtx.fillRect(0, y - 2, 1024, 4)
    })

    // Authentic Chola Epigraphical Inscriptions:
    // Excerpts from the Brihadisvara South Wall Inscription of Rajaraja Chola I (1010 CE)
    const inscriptionLines = [
      'ஸவஸ்திஸ்ரீ கோப்பரகேஸரிவன்மரான உடையார் ஸ்ரீராஜராஜதேவர்க்கு யாண்டு இருபத்தைந்தாவது',
      'திருமகள் போலப் பெருநிலச் செல்வியுந் தநக்கேயுரிமை பூண்டமை மநக்கொளக்',
      'காந்தளூர்ச் சாலை கலமறுத்தருளி வேங்கைநாடுங் கங்கபாடியுந் தடிகைபாடியும்',
      'நொளம்பபாடியுங் குடமலைநாடுங் கொல்லமுங் கலிங்கமுமெண்டிசை புகழத்',
      'தண்டாற்கொண்ட தன்னெழில் வளரூழியுளெல்லா யாண்டுந் தொழுதக விளங்கும்',
      'ஸ்ரீராஜராஜீசுவரமுடைய பரமசுவாமிக்குத் தஞ்சாவூர் எடுப்பித்த கற்றளி',
      'திருவிமானம் கல்வெட்டில் வெட்டியருளின திருவாணைப்படி ஆவணங்கள்',
      'பொன்னின் கலசமும் நவமணிகளும் ஆடவல்லான் பெருவுடையார்க்கு அருளி',
      'தளிச்சேரிப் பெண்டுகள் நால்வர்க்கும் நிவந்தங்கள் சந்திராதித்தவல் நிற்பதாக',
      'குஞ்சர மல்லனான இராஜராஜப் பெருந்தச்சன் கணித்த விதிப்படி அமைந்தது',
    ]

    ctx.textAlign = 'left'
    bCtx.textAlign = 'left'

    inscriptionLines.forEach((line, idx) => {
      // Top and bottom masonry course bands have padding
      const y = 88 + idx * 36

      // Deep V-cut chisel groove shadow
      ctx.font = 'bold 19px "Noto Serif Tamil", "Bhavani", serif'
      ctx.fillStyle = 'rgba(32, 18, 10, 0.85)'
      ctx.fillText(line, 45, y)

      // Chisel bevel highlight (sunlit lower lip of carved groove)
      ctx.fillStyle = 'rgba(255, 235, 195, 0.35)'
      ctx.fillText(line, 46, y + 1.2)

      // Bump map representation of carved grooving
      bCtx.font = 'bold 19px "Noto Serif Tamil", "Bhavani", serif'
      bCtx.fillStyle = '#101010' // deep cut
      bCtx.fillText(line, 45, y)
      bCtx.fillStyle = '#f0f0f0' // relief highlight
      bCtx.fillText(line, 46, y + 1.2)
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping

    const bTex = new THREE.CanvasTexture(bCanvas)
    bTex.wrapS = THREE.ClampToEdgeWrapping
    bTex.wrapT = THREE.ClampToEdgeWrapping

    return { inscriptionTexture: tex, bumpTexture: bTex }
  }, [])

  // Flame flicker animation
  useFrame(({ clock }) => {
    if (lampLightRef.current) {
      const t = clock.getElapsedTime()
      // Multi-frequency organic flame pulse
      const flicker =
        Math.sin(t * 11) * 0.08 +
        Math.sin(t * 23) * 0.05 +
        Math.sin(t * 41) * 0.03 +
        (Math.random() - 0.5) * 0.04
      const baseIntensity = timeOfDay === 'night' ? 2.4 : 1.2
      lampLightRef.current.intensity = baseIntensity + flicker

      if (flameMeshRef.current) {
        const s = 1.0 + flicker * 0.3
        flameMeshRef.current.scale.set(s, s * 1.3, s)
      }
    }
  })

  return (
    <group position={[-15.65, 3.2, -25.0]} rotation={[0, Math.PI / 2, 0]}>
      {/* 1. Main Inscribed Upapitha Granite Plinth Panel */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[9.2, 3.2, 0.45]} />
        <meshStandardMaterial
          map={inscriptionTexture}
          bumpMap={bumpTexture}
          bumpScale={0.065}
          roughness={0.78}
          metalness={0.04}
          color="#d2a878"
        />
      </mesh>

      {/* 2. Top Granite Cornice Molding (Pattika) */}
      <mesh receiveShadow castShadow position={[0, 1.72, 0.05]}>
        <boxGeometry args={[9.5, 0.28, 0.6]} />
        <meshStandardMaterial color="#8a5e38" roughness={0.84} metalness={0.02} />
      </mesh>

      {/* 3. Base Granite Plinth Step (Upana) */}
      <mesh receiveShadow castShadow position={[0, -1.72, 0.12]}>
        <boxGeometry args={[9.6, 0.36, 0.72]} />
        <meshStandardMaterial color="#78502e" roughness={0.88} metalness={0.02} />
      </mesh>

      {/* 4. Carved Stone Deepam Oil Lamp Bracket (at corner of inscription wall) */}
      <group position={[4.1, -0.2, 0.42]}>
        {/* Stone projection bracket */}
        <mesh receiveShadow castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.22, 0.15, 0.4, 12]} />
          <meshStandardMaterial color="#6a4c32" roughness={0.86} />
        </mesh>

        {/* Brass Deepam Oil Bowl (Agal Vilakku) */}
        <mesh receiveShadow castShadow position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.08, 0.12, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Sacred Flickering Flame */}
        <mesh ref={flameMeshRef} position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ffaa22" />
        </mesh>

        {/* Outer Warm Flame Glow Halo */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.22} depthWrite={false} />
        </mesh>

        {/* Dedicated PointLight casting warm illumination on the chiseled inscriptions */}
        <pointLight
          ref={lampLightRef}
          position={[0, 0.3, 0.25]}
          color="#ffb355"
          intensity={timeOfDay === 'night' ? 2.4 : 1.2}
          distance={8.5}
          decay={2}
          castShadow
        />
      </group>
    </group>
  )
}

export default TempleInscriptionsWall
