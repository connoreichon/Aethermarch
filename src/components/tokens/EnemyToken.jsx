export default function EnemyToken({ enemyId, size = 64 }) {
  const s = size

  if (enemyId === 'runic_raider') {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="60" rx="12" ry="3" fill="rgba(0,0,0,0.35)" />
        {/* cloak — ragged */}
        <path d="M18 28 Q12 42 16 56 L24 54 L24 36 Z" fill="#1A1010" opacity="0.9" />
        <path d="M46 28 Q52 42 48 56 L40 54 L40 36 Z" fill="#1A1010" opacity="0.9" />
        {/* torso */}
        <rect x="22" y="26" width="20" height="18" rx="3" fill="#2A1810" />
        {/* body */}
        <rect x="25" y="40" width="6" height="16" rx="2" fill="#2A1A10" />
        <rect x="33" y="40" width="6" height="16" rx="2" fill="#2A1A10" />
        {/* arms */}
        <rect x="13" y="28" width="10" height="16" rx="3" fill="#2A1810" />
        <rect x="41" y="28" width="10" height="16" rx="3" fill="#2A1810" />
        {/* dagger right */}
        <rect x="50" y="36" width="2" height="12" rx="1" fill="#626B6F" />
        <rect x="48" y="34" width="6" height="3" rx="1" fill="#383D3F" />
        {/* bag left */}
        <ellipse cx="14" cy="44" rx="5" ry="4" fill="#3A2618" />
        <line x1="14" y1="40" x2="14" y2="36" stroke="#4B321F" strokeWidth="1.5" />
        {/* head */}
        <ellipse cx="32" cy="18" rx="8" ry="9" fill="#C8B88A" />
        {/* torn hood */}
        <path d="M20 14 Q20 6 32 6 Q44 6 44 14 L40 22 L32 24 L24 22 Z" fill="#1A1010" />
        {/* rune on forehead — red apagado */}
        <text x="28" y="16" fontSize="6" fill="#8A2020" opacity="0.8" fontFamily="serif">ᚱ</text>
        {/* eyes */}
        <ellipse cx="28" cy="18" rx="1.5" ry="1.5" fill="#8A2020" />
        <ellipse cx="36" cy="18" rx="1.5" ry="1.5" fill="#8A2020" />
      </svg>
    )
  }

  if (enemyId === 'fracture_beast') {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="61" rx="14" ry="3" fill="rgba(0,0,0,0.35)" />
        {/* body — low arched */}
        <ellipse cx="32" cy="44" rx="18" ry="11" fill="#2A1A28" />
        {/* spines/plates irregular */}
        <path d="M18 38 L15 28 L21 36 Z" fill="#3A2A38" />
        <path d="M26 34 L24 22 L30 32 Z" fill="#3A2A38" />
        <path d="M36 33 L35 21 L41 31 Z" fill="#3A2A38" />
        <path d="M44 36 L44 26 L49 34 Z" fill="#3A2A38" />
        {/* fracture glow */}
        <path d="M24 40 L28 36 L30 42 L26 44 Z" fill="#6D5A9C" opacity="0.35" />
        <path d="M38 38 L42 34 L43 40 L39 42 Z" fill="#8A2020" opacity="0.3" />
        {/* head — forward low */}
        <ellipse cx="20" cy="48" rx="11" ry="8" fill="#2A1A28" />
        {/* jaws */}
        <path d="M10 50 Q12 56 20 56 Q28 56 30 50" fill="#1A0A18" />
        {/* teeth */}
        <path d="M12 50 L13 54 M16 51 L17 55 M20 51 L20 55 M24 51 L25 55 M28 50 L29 54"
              stroke="#C8B88A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        {/* eye */}
        <ellipse cx="22" cy="46" rx="2.5" ry="2.5" fill="#6D5A9C" />
        <ellipse cx="22" cy="46" rx="1.2" ry="1.2" fill="#070807" />
        {/* claws */}
        <path d="M14 54 L10 58 M18 56 L16 60 M22 57 L21 61" stroke="#626B6F" strokeWidth="1.5" strokeLinecap="round" />
        {/* hind legs */}
        <rect x="36" y="52" width="7" height="10" rx="3" fill="#2A1A28" />
        <rect x="46" y="50" width="7" height="10" rx="3" fill="#2A1A28" />
        {/* tail */}
        <path d="M50 44 Q58 40 60 48 Q58 56 52 54" stroke="#3A2A38" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (enemyId === 'sleeping_golem') {
    return (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="62" rx="18" ry="4" fill="rgba(0,0,0,0.45)" />
        {/* legs — short wide */}
        <rect x="20" y="50" width="10" height="12" rx="2" fill="#2F3437" />
        <rect x="34" y="50" width="10" height="12" rx="2" fill="#2F3437" />
        {/* torso — massive block */}
        <rect x="14" y="22" width="36" height="30" rx="3" fill="#383D3F" />
        {/* stone texture lines */}
        <line x1="14" y1="34" x2="50" y2="34" stroke="#2F3437" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="44" x2="50" y2="44" stroke="#2F3437" strokeWidth="1" opacity="0.6" />
        <line x1="32" y1="22" x2="32" y2="52" stroke="#2F3437" strokeWidth="1" opacity="0.4" />
        {/* arms — pillar-like */}
        <rect x="2" y="22" width="13" height="28" rx="3" fill="#383D3F" />
        <rect x="49" y="22" width="13" height="28" rx="3" fill="#383D3F" />
        {/* fists */}
        <rect x="2" y="46" width="14" height="10" rx="2" fill="#2F3437" />
        <rect x="48" y="46" width="14" height="10" rx="2" fill="#2F3437" />
        {/* chest ember cracks */}
        <path d="M24 32 L28 28 L30 34 L26 36 Z" fill="#D46A2D" opacity="0.5" />
        <path d="M36 34 L40 30 L41 36 L37 38 Z" fill="#D46A2D" opacity="0.4" />
        {/* head — small inset */}
        <rect x="23" y="10" width="18" height="14" rx="3" fill="#383D3F" />
        <rect x="24" y="11" width="16" height="12" rx="2" fill="#2F3437" />
        {/* eyes — awakening ember */}
        <ellipse cx="29" cy="17" rx="3" ry="2" fill="#D46A2D" opacity="0.8" />
        <ellipse cx="35" cy="17" rx="3" ry="2" fill="#D46A2D" opacity="0.8" />
        <ellipse cx="29" cy="17" rx="1.5" ry="1" fill="#8A3F1D" />
        <ellipse cx="35" cy="17" rx="1.5" ry="1" fill="#8A3F1D" />
        {/* crack across face */}
        <path d="M26 12 L30 22" stroke="#D46A2D" strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  }

  // fracture_guardian
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="62" rx="14" ry="3" fill="rgba(0,0,0,0.3)" />
      {/* core glow */}
      <ellipse cx="32" cy="36" rx="16" ry="16" fill="#4F8F95" opacity="0.06" />
      {/* torso vertical */}
      <rect x="24" y="24" width="16" height="28" rx="4" fill="#2F3437" />
      {/* fractured core */}
      <path d="M29 32 L32 26 L35 32 L32 38 Z" fill="#4F8F95" opacity="0.6" />
      <path d="M30 32 L32 28 L34 32 Z" fill="#9BE0E8" opacity="0.35" />
      {/* crack lines */}
      <path d="M28 30 L24 26 M34 34 L40 40" stroke="#4F8F95" strokeWidth="0.8" opacity="0.5" />
      <path d="M34 30 L38 26 M30 36 L24 42" stroke="#6D5A9C" strokeWidth="0.7" opacity="0.4" />
      {/* broken crown */}
      <path d="M24 24 L26 16 L32 20 L38 16 L40 24 Z" fill="#383D3F" />
      <path d="M26 16 L24 10 M32 20 L32 12 M38 16 L40 10" stroke="#4F8F95" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      {/* shoulders — crystal spikes */}
      <path d="M24 28 L14 22 L18 30 Z" fill="#4F8F95" opacity="0.5" />
      <path d="M40 28 L50 22 L46 30 Z" fill="#4F8F95" opacity="0.5" />
      {/* floating fragments */}
      <rect x="12" y="32" width="5" height="5" rx="1" fill="#383D3F" opacity="0.7" transform="rotate(20,14.5,34.5)" />
      <rect x="46" y="34" width="4" height="4" rx="1" fill="#383D3F" opacity="0.6" transform="rotate(-15,48,36)" />
      <rect x="16" y="44" width="3" height="3" rx="0.5" fill="#4F8F95" opacity="0.4" transform="rotate(30,17.5,45.5)" />
      {/* eye / nucleus */}
      <ellipse cx="32" cy="36" rx="3.5" ry="3.5" fill="#4F8F95" opacity="0.5" />
      <ellipse cx="32" cy="36" rx="2" ry="2" fill="#C8B88A" opacity="0.3" />
      {/* legs — barely there */}
      <rect x="26" y="50" width="5" height="12" rx="2" fill="#2F3437" opacity="0.8" />
      <rect x="33" y="50" width="5" height="12" rx="2" fill="#2F3437" opacity="0.8" />
    </svg>
  )
}
