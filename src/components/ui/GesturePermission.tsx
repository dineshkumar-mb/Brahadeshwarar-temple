import React from 'react'
import { useExperienceStore } from '../../state/experienceStore'
import { Hand, Mouse, ShieldCheck, Sparkles } from 'lucide-react'

export const GesturePermission: React.FC = () => {
  const showModal = useExperienceStore((s) => s.showPermissionModal)
  const isEnabled = useExperienceStore((s) => s.isHandTrackingEnabled)
  const setShowPermissionModal = useExperienceStore((s) => s.setShowPermissionModal)
  const setHandTrackingEnabled = useExperienceStore((s) => s.setHandTrackingEnabled)
  const setInputMode = useExperienceStore((s) => s.setInputMode)

  if (!showModal || isEnabled) return null

  const handleEnableHand = () => {
    setShowPermissionModal(false)
    setHandTrackingEnabled(true)
    setInputMode('hand')
  }

  const handleUseMouse = () => {
    setShowPermissionModal(false)
    setHandTrackingEnabled(false)
    setInputMode('mouse')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-500 animate-fadeIn"
    >
      <div className="relative max-w-md w-full p-8 rounded-2xl bg-gradient-to-b from-[#16120e] to-[#0a0807] border border-amber-500/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] text-center">
        {/* Sacred Chola ornament badge */}
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-inner">
          <Hand className="w-7 h-7 text-amber-400" />
        </div>

        <span className="text-amber-500 font-mono text-xs uppercase tracking-[0.25em]">
          Interactive Cinematic Heritage
        </span>

        <h2 id="permission-dialog-title" className="mt-2 text-2xl md:text-3xl font-serif text-amber-100 font-semibold tracking-wide">
          Brihadisvara
        </h2>
        <p className="text-stone-400 text-xs font-serif italic mt-0.5">
          Thanjavur Peruvudaiyar Kovil • 1010 CE
        </p>

        <p className="mt-4 text-stone-300 text-sm leading-relaxed">
          Use your hand to explore the temple. Raise your hand in front of your camera to ascend the
          cinematic journey, orbit the granite vimana, and pinch to inspect sacred sculptures.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleEnableHand}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-semibold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enable Hand Control</span>
          </button>

          <button
            type="button"
            onClick={handleUseMouse}
            className="w-full py-2.5 px-6 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 border border-stone-700/50 text-stone-400 hover:text-stone-200 text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Mouse className="w-3.5 h-3.5" />
            <span>Use mouse instead</span>
          </button>
        </div>

        {/* Privacy note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>Local on-device processing. No video is ever stored or transmitted.</span>
        </div>
      </div>
    </div>
  )
}
