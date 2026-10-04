import React, { useMemo } from 'react'
import { useExperienceStore } from '../../state/experienceStore'

/**
 * SkyEffectsOverlay
 * ─────────────────
 * A full-screen CSS-only layer that adds dramatic atmospheric effects on top
 * of the Three.js canvas.  Nothing here captures pointer events.
 *
 * DAY  ─ Warm golden sun bloom (upper-right), slowly rotating god-rays,
 *         lens-flare streaks, warm horizon wash.
 * NIGHT ─ Cool silver moon bloom (upper-left), moon halo ring, twinkling
 *         CSS star dots, moonbeam column, night-sky vignette.
 *
 * All transitions are driven by a 3-second CSS opacity fade so the switch
 * matches the Three.js nightPhase lerp speed.
 */
export const SkyEffectsOverlay: React.FC = () => {
  const timeOfDay = useExperienceStore((s) => s.timeOfDay)
  const isNight   = timeOfDay === 'night'

  // Deterministic star positions (computed once per mount)
  const stars = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    id: i,
    x:   ((i * 23.7 + 11.3) % 96) + 2,
    y:   ((i * 17.1 +  6.9) % 50) + 2,
    sz:  ((i * 3.14) % 2.4) + 0.7,
    del: (i * 0.22) % 9,
    dur: 2.8 + (i * 0.53) % 5.5,
    br:  0.35 + (i * 0.047) % 0.65,
    anim: i % 3 === 0 ? 'soe-twinkle-a' : 'soe-twinkle-b',
  })), [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── injected keyframes ──────────────────────────────────────────── */}
      <style>{`
        @keyframes soe-rays-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes soe-flare-a {
          0%,100%{ opacity:0; } 45%{ opacity:1; } 55%{ opacity:0.7; }
        }
        @keyframes soe-flare-b {
          0%,100%{ opacity:0; } 35%{ opacity:0.6; }
        }
        @keyframes soe-moon-pulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%    { opacity:0.72; transform:scale(1.06); }
        }
        @keyframes soe-twinkle-a {
          0%,100%{ opacity:0.35; transform:scale(1);   }
          50%    { opacity:1;    transform:scale(1.35); }
        }
        @keyframes soe-twinkle-b {
          0%,100%{ opacity:0.18; transform:scale(0.85); }
          60%    { opacity:0.95; transform:scale(1.25); }
        }
        @keyframes soe-moonbeam {
          0%,100%{ opacity:0.55; }
          50%    { opacity:0.8;  }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          ☀  DAY — SUNSHINE EFFECTS
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:'absolute', inset:0,
        opacity: isNight ? 0 : 1,
        transition: 'opacity 3s ease-in-out',
      }}>
        {/* ❶ Large sun bloom at upper-right */}
        <div style={{
          position:'absolute', top:'-18%', right:'-12%',
          width:'72%', height:'72%', borderRadius:'50%',
          background:`radial-gradient(ellipse at center,
            rgba(255,240,150,0.26) 0%,
            rgba(255,210, 90,0.14) 22%,
            rgba(255,175, 55,0.07) 48%,
            transparent 72%
          )`,
        }}/>

        {/* ❷ Rotating conic god-rays (pivot = sun position) */}
        <div style={{
          position:'absolute', inset:0,
          background:`repeating-conic-gradient(
            from 0deg at 84% 15%,
            rgba(255,225,85,0.055) 0deg 2.5deg,
            transparent           2.5deg 20deg
          )`,
          transformOrigin: '84% 15%',
          animation: 'soe-rays-spin 100s linear infinite',
        }}/>

        {/* ❸ Warm inner bloom (soft secondary glow around sun) */}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse at 84% 0%,
            rgba(255,200,60,0.10) 0%,
            rgba(255,165,30,0.05) 30%,
            transparent 58%
          )`,
        }}/>

        {/* ❹ Horizon golden wash */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'28%',
          background:`linear-gradient(to top,
            rgba(255,160,50,0.09),
            rgba(255,195,80,0.04),
            transparent
          )`,
        }}/>

        {/* ❺ Lens-flare streaks */}
        <div style={{
          position:'absolute', top:'7%', right:'14%',
          width:'2px', height:'220px',
          background:'linear-gradient(to bottom,transparent,rgba(255,245,190,0.3),transparent)',
          transform:'rotate(-28deg)',
          animation:'soe-flare-a 10s ease-in-out infinite',
        }}/>
        <div style={{
          position:'absolute', top:'4%', right:'21%',
          width:'1.5px', height:'145px',
          background:'linear-gradient(to bottom,transparent,rgba(255,230,155,0.22),transparent)',
          transform:'rotate(-18deg)',
          animation:'soe-flare-b 10s 4s ease-in-out infinite',
        }}/>
        <div style={{
          position:'absolute', top:'11%', right:'10%',
          width:'1px', height:'100px',
          background:'linear-gradient(to bottom,transparent,rgba(255,255,200,0.18),transparent)',
          transform:'rotate(-36deg)',
          animation:'soe-flare-a 10s 7s ease-in-out infinite',
        }}/>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          🌕  NIGHT — MOONSHINE EFFECTS
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:'absolute', inset:0,
        opacity: isNight ? 1 : 0,
        transition: 'opacity 3s ease-in-out',
      }}>
        {/* ❶ Moon bloom at upper-left */}
        <div style={{
          position:'absolute', top:'-10%', left:'7%',
          width:'55%', height:'55%', borderRadius:'50%',
          background:`radial-gradient(ellipse at center,
            rgba(210,230,255,0.22) 0%,
            rgba(170,205,255,0.12) 22%,
            rgba(130,175,255,0.06) 48%,
            transparent 75%
          )`,
          animation:'soe-moon-pulse 7s ease-in-out infinite',
        }}/>

        {/* ❷ Moon halo ring */}
        <div style={{
          position:'absolute', top:'3.5%', left:'15%',
          width:'140px', height:'140px', borderRadius:'50%',
          border:'1.5px solid rgba(180,215,255,0.18)',
          boxShadow:'0 0 35px 18px rgba(150,200,255,0.07)',
          animation:'soe-moon-pulse 9s ease-in-out infinite',
        }}/>

        {/* ❸ Cool blue ambient from upper-left */}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse at 22% 0%,
            rgba(90,130,255,0.09) 0%,
            rgba(55,100,210,0.04) 40%,
            transparent 68%
          )`,
        }}/>

        {/* ❹ Night vignette (darkened edges) */}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse at 50% 50%,
            transparent 25%,
            rgba(2,5,20,0.42) 100%
          )`,
        }}/>

        {/* ❺ Cool blue overall tint */}
        <div style={{
          position:'absolute', inset:0,
          background:'rgba(8,12,36,0.22)',
        }}/>

        {/* ❻ Moonbeam column (vertical silver shaft below moon) */}
        <div style={{
          position:'absolute', top:'12%', left:'17%',
          width:'90px', bottom:0,
          background:`linear-gradient(to bottom,
            rgba(190,220,255,0.10),
            rgba(170,210,255,0.06) 30%,
            rgba(140,190,255,0.02) 65%,
            transparent
          )`,
          transform:'skewX(-4deg)',
          animation:'soe-moonbeam 6s ease-in-out infinite',
        }}/>

        {/* ❼ Silver ground shimmer (silvery cast near horizon) */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'22%',
          background:`linear-gradient(to top,
            rgba(160,200,255,0.07),
            rgba(140,185,255,0.03),
            transparent
          )`,
        }}/>

        {/* ❽ CSS twinkling star dots */}
        {stars.map(s => (
          <div
            key={s.id}
            style={{
              position:'absolute',
              left:`${s.x}%`,
              top:`${s.y}%`,
              width:`${s.sz}px`,
              height:`${s.sz}px`,
              borderRadius:'50%',
              background:`rgba(255,255,255,${s.br})`,
              animation:`${s.anim} ${s.dur}s ${s.del}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default SkyEffectsOverlay
