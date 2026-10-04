import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useExperienceStore } from '../../state/experienceStore'
import { inputController } from '../input/InputController'
import { TEMPLE_HOTSPOTS } from '../../data/templeData'

/**
 * Cinematic Camera System for Brihadisvara Temple
 * Delivers smooth spline transitions between 8 architecturally choreographed viewpoints:
 * 1. Establishing Perspective (Grand entrance & soaring 66m Vimana)
 * 2. Sacred Approach (Passing through the Keralantakan Gopuram)
 * 3. Colossal Nandi Mandapam (Monolithic black granite Nandi)
 * 4. Axial Mandapas (Lateral stairs, Yali balustrades, hypostyle halls)
 * 5. Sanctum Walls & Epigraphy (Devakoshtas, inscriptions, pilasters)
 * 6. Soaring Sri Vimana (Sheer 13-storey pyramidal tower)
 * 7. Monolithic Sikhara & 4 Nandis (80-tonne dome & golden Kalasam)
 * 8. Living Heritage Finale (Golden hour panoramic overview)
 */
export const TempleCamera: React.FC = () => {
  const { camera } = useThree()
  const isFocusMode = useExperienceStore((s) => s.isFocusMode)
  const activeHotspotId = useExperienceStore((s) => s.activeHotspotId)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)
  const bounds = useExperienceStore((s) => s.modelBounds)

  const currentPos = useRef(new THREE.Vector3(0, 4.2, 174))
  const currentTarget = useRef(new THREE.Vector3(0, 10.5, 128))

  // 8 Architecturally Choreographed Waypoints
  const waypoints = useMemo(() => [
    // 0. (0.00) Inception / Grand Entrance: Authentic view of Keralantakan Gopuram matching entrance.jpg
    {
      progress: 0.0,
      pos: new THREE.Vector3(0, 4.2, 174),
      target: new THREE.Vector3(0, 10.5, 128),
    },
    // 1. (0.15) Sacred Approach: Passing through the open portal into the sunlit inner courtyard
    {
      progress: 0.15,
      pos: new THREE.Vector3(0, 3.8, 118),
      target: new THREE.Vector3(0, 5.5, 66),
    },
    // 2. (0.35) Celestial Vimana: Towering dramatic low-angle looking straight up the 13 talas
    {
      progress: 0.35,
      pos: new THREE.Vector3(16, 12, -2),
      target: new THREE.Vector3(0, 36, -25),
    },
    // 3. (0.55) Architecture in the Round: Lateral profile showing full massing
    {
      progress: 0.55,
      pos: new THREE.Vector3(-36, 16, -25),
      target: new THREE.Vector3(0, 20, -25),
    },
    // 4. (0.72) Garbhagriha Sanctum: The sacred Peruvudaiyar Maha Lingam (matching lingam.jpg)
    {
      progress: 0.72,
      pos: new THREE.Vector3(0, 5.2, -16.5),
      target: new THREE.Vector3(0, 5.8, -25.0),
    },
    // 5. (0.85) Granite Monoliths: Unobstructed view of the 25-tonne black granite Nandi (matching nandhi-sideview.jpg)
    {
      progress: 0.85,
      pos: new THREE.Vector3(-6.8, 4.6, 52.5),
      target: new THREE.Vector3(0, 4.2, 65.5),
    },
    // 6. (0.93) Historical Summit: 80-tonne octagonal dome, 4 corner Nandis & golden Kalasam
    {
      progress: 0.93,
      pos: new THREE.Vector3(-15, 56, -14),
      target: new THREE.Vector3(0, 52, -25),
    },
    // 7. (0.98) Living Heritage Finale: Grand panoramic golden-hour overview
    {
      progress: 0.98,
      pos: new THREE.Vector3(50, 28, 60),
      target: new THREE.Vector3(0, 18, -10),
    },
  ], [])

  // Exact smoothstep interpolation between milestone waypoints
  const getCameraKeyframe = (t: number) => {
    const clampedT = Math.max(0, Math.min(0.98, t))
    let i = 0
    while (i < waypoints.length - 2 && clampedT >= waypoints[i + 1].progress) {
      i++
    }
    const w0 = waypoints[i]
    const w1 = waypoints[i + 1]
    const span = Math.max(0.0001, w1.progress - w0.progress)
    const localT = Math.max(0, Math.min(1, (clampedT - w0.progress) / span))
    const smoothT = localT * localT * (3 - 2 * localT) // cubic smoothstep

    const p = new THREE.Vector3().lerpVectors(w0.pos, w1.pos, smoothT)
    const tgt = new THREE.Vector3().lerpVectors(w0.target, w1.target, smoothT)
    return { pos: p, target: tgt }
  }

  useFrame((_, delta) => {
    // 1. Step the InputController smooth physics
    const { progress, orbitAngle, orbitElevation, zoom } = inputController.update(delta)

    let desiredPos = new THREE.Vector3()
    let desiredTarget = new THREE.Vector3()

    // 2. Determine base camera position from Focus Mode or Dynamic Cinematic Spline
    if (isFocusMode && activeHotspotId) {
      const hotspot = TEMPLE_HOTSPOTS.find((h) => h.id === activeHotspotId)
      if (hotspot) {
        desiredPos.set(...hotspot.cameraPos)
        desiredTarget.set(...hotspot.cameraTarget)
      } else {
        const kf = getCameraKeyframe(progress)
        desiredPos = kf.pos
        desiredTarget = kf.target
      }
    } else {
      // Dynamic cinematic camera interpolation based on progress (0..1)
      const kf = getCameraKeyframe(progress)
      desiredPos = kf.pos
      desiredTarget = kf.target
    }

    // 3. Apply user orbit angle & elevation relative to target
    if (orbitAngle !== 0 || orbitElevation !== 0) {
      const offset = desiredPos.clone().sub(desiredTarget)
      const radius = offset.length()

      let theta = Math.atan2(offset.x, offset.z) + orbitAngle
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius))) - orbitElevation
      phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, phi))

      offset.x = radius * Math.sin(phi) * Math.sin(theta)
      offset.y = radius * Math.cos(phi)
      offset.z = radius * Math.sin(phi) * Math.cos(theta)

      desiredPos = desiredTarget.clone().add(offset)
    }

    // 4. Apply Zoom Factor
    if (zoom !== 1.0) {
      const zoomOffset = desiredPos.clone().sub(desiredTarget).multiplyScalar(1 / zoom)
      desiredPos = desiredTarget.clone().add(zoomOffset)
    }

    // 5. Collision Limit: Enforce minimum distance from target
    const minDistance = 3.5
    const distToTarget = desiredPos.distanceTo(desiredTarget)
    if (distToTarget < minDistance) {
      const dir = desiredPos.clone().sub(desiredTarget).normalize()
      desiredPos.copy(desiredTarget).add(dir.multiplyScalar(minDistance))
    }

    // 6. Ground Clamp: Camera never clips beneath courtyard floor
    desiredPos.y = Math.max(1.4, desiredPos.y)

    // 7. Smooth spring damping (lerp)
    const damping = reducedMotion ? 12 : 5.0
    const alpha = Math.min(1.0, delta * damping)

    currentPos.current.lerp(desiredPos, alpha)
    currentTarget.current.lerp(desiredTarget, alpha)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentTarget.current)
  })

  return null
}

export default TempleCamera
