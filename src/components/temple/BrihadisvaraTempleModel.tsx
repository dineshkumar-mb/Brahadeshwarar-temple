import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, Html } from '@react-three/drei'
import { useExperienceStore } from '../../state/experienceStore'
import { AlertCircle, Upload, FileCode, CheckCircle2, Box } from 'lucide-react'

export const DEFAULT_MODEL_PATH = '/models/brihadisvara-temple.glb'

interface RealTempleGLBLoaderProps {
  url: string
}

/**
 * Dedicated Real 3D GLB Loader for Brihadisvara Temple
 * Traverses actual 3D geometry, applies PBR granite materials,
 * calculates bounding box and configures dynamic camera framing.
 */
const RealTempleGLBLoader: React.FC<RealTempleGLBLoaderProps> = ({ url }) => {
  const gltf = useGLTF(url)
  const setModelBounds = useExperienceStore((s) => s.setModelBounds)
  const groupRef = useRef<THREE.Group | null>(null)

  // Procedural stone bump map for authentic granite masonry texture
  const stoneBumpMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, 256, 256)
      // Chiseled granite speckle & tooling grain
      for (let i = 0; i < 12000; i++) {
        const x = Math.random() * 256
        const y = Math.random() * 256
        const v = Math.floor(Math.random() * 90 + 75)
        ctx.fillStyle = `rgb(${v},${v},${v})`
        ctx.fillRect(x, y, 1.5, 1.5)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(18, 18)
    return tex
  }, [])

  useEffect(() => {
    if (!gltf || !gltf.scene) return

    // 1. Calculate temple bounding box from the real 3D model
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    const radius = Math.max(1, size.length() * 0.5)

    // Save accurate bounds for camera sequence
    setModelBounds({
      centerX: center.x,
      centerY: center.y,
      centerZ: center.z,
      sizeX: size.x,
      sizeY: size.y,
      sizeZ: size.z,
      radius,
      isLoaded: true,
    })

    // 2. Traverse actual 3D geometry and configure realistic PBR materials
    gltf.scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const name = (mesh.name || '').toLowerCase()
        const matName = (mesh.material && !Array.isArray(mesh.material) ? mesh.material.name : '').toLowerCase()

        if (name.includes('goldfinial') || matName.includes('gold')) {
          // Gilded Copper / Gold Kalasam Stupis
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Gilded_Gold_Kalasam',
            color: new THREE.Color('#f5b842'),
            roughness: 0.18,
            metalness: 0.90,
            emissive: new THREE.Color('#382200'),
          })
        } else if (name.includes('nandi') || matName.includes('nandi')) {
          // Sacred Monolithic Nandi Bull (Dark crystalline polished granite with subtle sheen)
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Monolithic_Nandi_Granite',
            color: new THREE.Color('#2a2723'),
            roughness: 0.24,
            metalness: 0.16,
            bumpMap: stoneBumpMap,
            bumpScale: 0.012,
          })
        } else if (name.includes('sanctumwall') || matName.includes('sanctum')) {
          // Sacred Garbhagriha Inner Sanctum Walls (Atmospheric dark granite with oil smoke patina matching lingam.jpg)
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Garbhagriha_Sanctum_Walls',
            color: new THREE.Color('#302820'),
            roughness: 0.88,
            metalness: 0.04,
            bumpMap: stoneBumpMap,
            bumpScale: 0.04,
          })
        } else if (name.includes('lawn') || matName.includes('lawn')) {
          // Entrance Manicured Lawn Verges (matching entrance.jpg)
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Entrance_Lawn_Verge',
            color: new THREE.Color('#4c5e2e'),
            roughness: 0.94,
            metalness: 0.0,
          })
        } else if (name.includes('details') || matName.includes('carving') || matName.includes('molding')) {
          // Sculptural reliefs, cornices, bell necklaces, and Dvarapala ornaments
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Granite_Carvings_Relief',
            color: new THREE.Color('#aa7644'),
            roughness: 0.74,
            metalness: 0.04,
            bumpMap: stoneBumpMap,
            bumpScale: 0.045,
          })
        } else if (name.includes('stonebase') || matName.includes('plinth')) {
          // Deep weathered granite plinth (Upapitha & Adhishthana)
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Thanjavur_Granite_Plinth',
            color: new THREE.Color('#9c6c40'),
            roughness: 0.86,
            metalness: 0.02,
            bumpMap: stoneBumpMap,
            bumpScale: 0.04,
          })
        } else if (name.includes('courtyard') || matName.includes('paving')) {
          // Weathered stone paving & approach pathway
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Courtyard_Paving',
            color: new THREE.Color('#78604c'),
            roughness: 0.90,
            metalness: 0.01,
          })
        } else {
          // Towering Sri Vimana, Gopuram, Sanctum Walls & Carvings (Warm Thanjavur Granite)
          mesh.material = new THREE.MeshStandardMaterial({
            name: 'Thanjavur_Golden_Granite',
            color: new THREE.Color('#c28c54'),
            roughness: 0.80,
            metalness: 0.03,
            bumpMap: stoneBumpMap,
            bumpScale: 0.035,
          })
        }
      }
    })
  }, [gltf, setModelBounds, stoneBumpMap])

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  )
}

interface ErrorBoundaryProps {
  fallback: (error: Error) => React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.warn('GLB Loader caught error:', error.message)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error)
    }
    return this.props.children
  }
}

/**
 * Development Placeholder: Shown ONLY when the real 3D GLB asset is not yet in public/models/
 * Clearly states the requirement without fake geometry or flat photo planes.
 */
interface ModelPlaceholderProps {
  errorMessage?: string
}

const BrihadisvaraModelRequired: React.FC<ModelPlaceholderProps> = ({ errorMessage }) => {
  const setCustomModelUrl = useExperienceStore((s) => s.setCustomModelUrl)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      const blobUrl = URL.createObjectURL(file)
      setCustomModelUrl(blobUrl)
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Development Overlay Billboard */}
      <Html position={[0, 6, 0]} center distanceFactor={26} zIndexRange={[20, 50]}>
        <div className="max-w-md w-[92vw] sm:w-[440px] p-6 rounded-2xl bg-stone-950/95 border-2 border-amber-500/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl text-left pointer-events-auto">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-2.5 text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              3D ASSET SPECIFICATION
            </span>
          </div>

          <h3 className="text-xl font-serif font-bold text-amber-100 mb-1">
            REAL BRIHADISVARA 3D MODEL REQUIRED
          </h3>

          <p className="text-stone-300 text-xs leading-relaxed mb-3">
            All procedural approximations and flat photo planes have been removed. Place your actual
            3D Brihadisvara Temple model asset at:
          </p>

          {/* Model File Target Path */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] text-amber-300 mb-3 select-all">
            <FileCode className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="truncate">public/models/brihadisvara-temple.glb</span>
          </div>

          {/* Required Texture Specifications */}
          <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/80 mb-4 text-[11px] font-mono text-stone-400 space-y-1">
            <span className="text-amber-400 font-semibold block mb-0.5">
              Asset Guidelines:
            </span>
            <div>• Formats: .glb (recommended) or .gltf with embedded PBR</div>
            <div>• If textures are external, include:</div>
            <div className="pl-3 text-stone-500">
              - BaseColor / Albedo map (warm Thanjavur granite)
              <br />
              - Normal map (stone relief & chiseling)
              <br />
              - Roughness map (0.80–0.88 stone roughness)
              <br />
              - Ambient Occlusion (plinth & tala depth)
            </div>
          </div>

          {/* Interactive Local File Selector */}
          <div className="pt-2 border-t border-stone-800">
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/60 text-amber-200 text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Select .GLB / .GLTF file from disk</span>
            </button>

            {selectedFileName && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Loaded: {selectedFileName}</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-2 text-[10px] font-mono text-stone-500">
              Status: {errorMessage}
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

/**
 * Main Brihadisvara Temple Model Component
 * Manages the GLB loading pipeline, verification, and error boundaries.
 * Does NOT generate fake boxes or photo planes.
 */
export const BrihadisvaraTempleModel: React.FC = () => {
  const modelPath = useExperienceStore((s) => s.modelPath)
  const customModelUrl = useExperienceStore((s) => s.customModelUrl)
  const activeUrl = customModelUrl || modelPath || DEFAULT_MODEL_PATH

  const [hasValidAsset, setHasValidAsset] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (customModelUrl) {
      setHasValidAsset(true)
      setLoadError(null)
      return
    }

    let isMounted = true

    // Inspect first 16 bytes to ensure asset exists and is not Vite's HTML 404 fallback
    fetch(activeUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-15' },
    })
      .then(async (res) => {
        if (!isMounted) return

        const contentType = res.headers.get('content-type') || ''

        if (!res.ok || contentType.includes('text/html')) {
          setHasValidAsset(false)
          setLoadError(`GLB asset not found at ${activeUrl}`)
          return
        }

        try {
          const buffer = await res.arrayBuffer()
          const header = new Uint8Array(buffer.slice(0, 4))
          const magic = String.fromCharCode(...header)

          if (
            magic === 'glTF' ||
            magic.startsWith('{') ||
            contentType.includes('gltf') ||
            contentType.includes('octet-stream')
          ) {
            setHasValidAsset(true)
            setLoadError(null)
          } else {
            setHasValidAsset(false)
            setLoadError(`File at ${activeUrl} is not a valid GLB/GLTF binary asset`)
          }
        } catch {
          setHasValidAsset(false)
          setLoadError(`Unable to parse binary header at ${activeUrl}`)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setHasValidAsset(false)
        setLoadError(err.message || 'Asset file check failed')
      })

    return () => {
      isMounted = false
    }
  }, [activeUrl, customModelUrl])

  if (hasValidAsset === false) {
    return <BrihadisvaraModelRequired errorMessage={loadError || undefined} />
  }

  if (hasValidAsset === null) {
    return null
  }

  return (
    <ModelErrorBoundary
      fallback={(err) => (
        <BrihadisvaraModelRequired
          errorMessage={err.message || 'Error parsing 3D model asset'}
        />
      )}
    >
      <React.Suspense fallback={<BrihadisvaraModelRequired errorMessage="Loading 3D asset..." />}>
        <RealTempleGLBLoader url={activeUrl} />
      </React.Suspense>
    </ModelErrorBoundary>
  )
}

export default BrihadisvaraTempleModel
