export default function CreatureToken({ creatureId, size = 72 }) {
  const s = size

  if (creatureId === 'velthar') {
    return (
      <img
        src={`${import.meta.env.BASE_URL}assets/generated/ciervo_velthar.png`}
        alt="Velthar"
        width={s}
        height={Math.round(s * 1.25)}
        style={{ objectFit: 'contain', imageRendering: 'auto' }}
      />
    )
  }

  if (creatureId === 'brontik') {
    return (
      <img
        src={`${import.meta.env.BASE_URL}assets/generated/brontik.png`}
        alt="Brontik"
        width={s}
        height={Math.round(s * 1.1)}
        style={{ objectFit: 'contain', imageRendering: 'auto' }}
      />
    )
  }

  // lumora
  return (
    <svg width={s} height={s} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="36" cy="67" rx="10" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* glow aura */}
      <ellipse cx="36" cy="36" rx="20" ry="20" fill="#4F8F95" opacity="0.05" />
      <ellipse cx="36" cy="36" rx="14" ry="14" fill="#6D5A9C" opacity="0.06" />
      {/* tail crystal flame */}
      <path d="M36 54 Q28 60 26 70 Q36 64 46 70 Q44 60 36 54 Z" fill="#4F8F95" opacity="0.5" />
      <path d="M36 54 Q31 59 30 66 Q36 62 42 66 Q41 59 36 54 Z" fill="#6D5A9C" opacity="0.55" />
      <path d="M36 54 Q34 58 34 63 Q36 61 38 63 Q38 58 36 54 Z" fill="#B8944A" opacity="0.4" />
      {/* body — small rounded */}
      <ellipse cx="36" cy="42" rx="11" ry="10" fill="#D4CCBC" />
      {/* crystal in chest */}
      <path d="M33 40 L36 35 L39 40 L36 45 Z" fill="#4F8F95" opacity="0.7" />
      <path d="M33 40 L36 37 L39 40 Z" fill="#9BE0E8" opacity="0.4" />
      {/* neck */}
      <rect x="33" y="30" width="6" height="10" rx="3" fill="#D4CCBC" />
      {/* head */}
      <ellipse cx="36" cy="25" rx="10" ry="9" fill="#D4CCBC" />
      {/* feather ears */}
      <path d="M27 20 Q22 12 25 8 Q28 14 30 20 Z" fill="#C8B88A" opacity="0.8" />
      <path d="M45 20 Q50 12 47 8 Q44 14 42 20 Z" fill="#C8B88A" opacity="0.8" />
      {/* eyes — curious */}
      <ellipse cx="31" cy="24" rx="2.5" ry="2.5" fill="#6D5A9C" />
      <ellipse cx="41" cy="24" rx="2.5" ry="2.5" fill="#6D5A9C" />
      <ellipse cx="31" cy="24" rx="1.2" ry="1.2" fill="#070807" />
      <ellipse cx="41" cy="24" rx="1.2" ry="1.2" fill="#070807" />
      {/* shine */}
      <ellipse cx="31.8" cy="23.2" rx="0.7" ry="0.7" fill="white" opacity="0.6" />
      <ellipse cx="41.8" cy="23.2" rx="0.7" ry="0.7" fill="white" opacity="0.6" />
      {/* small legs */}
      <rect x="30" y="50" width="5" height="8" rx="2.5" fill="#C0B8A8" />
      <rect x="37" y="50" width="5" height="8" rx="2.5" fill="#C0B8A8" />
      {/* tiny crystal sparks */}
      <circle cx="20" cy="32" r="1" fill="#4F8F95" opacity="0.4" />
      <circle cx="52" cy="30" r="1" fill="#6D5A9C" opacity="0.35" />
      <circle cx="18" cy="42" r="0.8" fill="#B8944A" opacity="0.3" />
    </svg>
  )
}
