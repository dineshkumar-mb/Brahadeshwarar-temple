import React, { useMemo } from 'react'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * Photorealistic SkyEffectsOverlay
 * ────────────────────────────────
 * A full-screen CSS optical layer that simulates cinematic lens diffusion,
 * atmospheric scattering, and photographic vignetting over the Three.js viewport.
 *
 * DAY:
 *   - Directional solar glare centered at the sun's celestial azimuth (82% 12%)
 *   - Soft anamorphic horizontal lens flare diffusion
 *   - Warm horizon atmospheric dust haze
 *   - Subtle photographic perimeter vignetting
 *
 * NIGHT:
 *   - Ethereal silvery lunar bloom centered at the moon's celestial position (18% 15%)
 *   - Photorealistic 22° atmospheric ice-crystal lunar halo (soft radial gradient)
 *   - Nocturnal horizon airglow
 *   - Deep cinematic nocturnal vignette focusing eye adaptation on illuminated stone & deepams
 *   - Delicate celestial star scintillation
 */
export const SkyEffectsOverlay: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const isNight   = timeOfDay === 'night'

  // Deterministic star positions with realistic optical blur and depth
  const stars = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x:   ((i * 27.3 + 13.1) % 94) + 3,
    y:   ((i * 19.7 +  7.3) % 44) + 2,
    sz:  ((i * 2.71) % 2.0) + 0.8,
    del: (i * 0.31) % 8,
    dur: 3.2 + (i * 0.47) % 5.0,
    br:  0.30 + (i * 0.052) % 0.60,
    blur: i % 4 === 0 ? '0.6px' : '0px',
  })), [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes soe-solar-breath {
          0%, 100% { opacity: 0.92; transform: scale(1); }
          50%      { opacity: 1.00; transform: scale(1.03); }
        }
        @keyframes soe-lunar-breath {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50%      { opacity: 1.00; transform: scale(1.02); }
        }
        @keyframes soe-star-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50%      { opacity: 1.00; transform: scale(1.2); }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          ☀️  DAY — NATURAL SUNLIGHT ATMOSPHERE
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isNight ? 0 : 1,
          transition: 'opacity 3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 1. Luminous Solar Glare (matching Sun 3D direction at upper-right) */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-15%',
            width: '85%',
            height: '85%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center,
              rgba(255, 250, 235, 0.24) 0%,
              rgba(255, 235, 185, 0.12) 22%,
              rgba(255, 210, 135, 0.05) 45%,
              transparent 72%
            )`,
            animation: 'soe-solar-breath 10s ease-in-out infinite',
          }}
        />

        {/* 2. Soft Anamorphic Lens Flare Horizontal Diffusion */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            right: 0,
            left: 0,
            height: '6px',
            background: `linear-gradient(90deg,
              transparent 35%,
              rgba(255, 240, 195, 0.04) 65%,
              rgba(255, 252, 235, 0.14) 82%,
              rgba(255, 230, 170, 0.05) 92%,
              transparent 100%
            )`,
            filter: 'blur(3px)',
            animation: 'soe-solar-breath 12s ease-in-out infinite',
          }}
        />

        {/* 3. Warm Horizon Atmospheric Dust Haze */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24%',
            background: `linear-gradient(to top,
              rgba(235, 205, 160, 0.08) 0%,
              rgba(245, 225, 190, 0.03) 55%,
              transparent 100%
            )`,
          }}
        />

        {/* 4. Natural Photographic Lens Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%,
              transparent 62%,
              rgba(25, 18, 10, 0.16) 100%
            )`,
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          🌕  NIGHT — NATURAL SILVERY MOONLIGHT ATMOSPHERE
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isNight ? 1 : 0,
          transition: 'opacity 3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 1. Silvery Lunar Radiance (matching Moon 3D direction at upper-left) */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '3%',
            width: '65%',
            height: '65%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center,
              rgba(225, 240, 255, 0.18) 0%,
              rgba(185, 215, 255, 0.08) 25%,
              rgba(140, 180, 245, 0.03) 50%,
              transparent 75%
            )`,
            animation: 'soe-lunar-breath 12s ease-in-out infinite',
          }}
        />

        {/* 2. Natural 22° Atmospheric Ice-Crystal Lunar Halo (Soft Diffuse Gradient, NO hard borders) */}
        <div
          style={{
            position: 'absolute',
            top: '3%',
            left: '12%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: `radial-gradient(circle at center,
              transparent 52%,
              rgba(195, 222, 255, 0.07) 72%,
              rgba(165, 202, 250, 0.03) 88%,
              transparent 100%
            )`,
            filter: 'blur(4px)',
            animation: 'soe-lunar-breath 14s ease-in-out infinite',
          }}
        />

        {/* 3. Nocturnal Horizon Airglow (Delicate silver mist along courtyard boundary) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '20%',
            background: `linear-gradient(to top,
              rgba(140, 180, 235, 0.05) 0%,
              rgba(110, 155, 220, 0.02) 45%,
              transparent 100%
            )`,
          }}
        />

        {/* 4. Deep Photographic Nocturnal Vignette (Guides focus to glowing temple & deepams) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%,
              transparent 48%,
              rgba(3, 7, 20, 0.40) 100%
            )`,
          }}
        />

        {/* 5. Delicate Celestial Star Twinkling Accents */}
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.sz}px`,
              height: `${s.sz}px`,
              borderRadius: '50%',
              background: `rgba(235, 245, 255, ${s.br})`,
              filter: `blur(${s.blur})`,
              animation: `soe-star-twinkle ${s.dur}s ${s.del}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default SkyEffectsOverlay
