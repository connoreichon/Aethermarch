export default function ArchetypeToken({ archetypeId, size = 72 }) {
  const s = size
  const half = s / 2

  if (archetypeId === 'heraldo') {
    return (
      <div style={{
        width: s, height: s,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(184,148,74,0.45)',
        boxShadow: '0 0 8px rgba(139,30,30,0.35)',
        flexShrink: 0,
        background: '#0a0404',
      }}>
        <img
          src={`${import.meta.env.BASE_URL}assets/generated/heraldo_botharms_s2014.png`}
          alt="Heraldo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 8%',
            display: 'block',
          }}
        />
      </div>
    )
  }

  if (archetypeId === 'guardian') {
    return (
      <svg width={s} height={s} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* base / shadow */}
        <ellipse cx="36" cy="66" rx="16" ry="4" fill="rgba(0,0,0,0.4)" />
        {/* boots */}
        <rect x="26" y="56" width="8" height="10" rx="2" fill="#2A1A10" />
        <rect x="36" y="56" width="8" height="10" rx="2" fill="#2A1A10" />
        {/* legs + body */}
        <rect x="27" y="38" width="7" height="20" rx="2" fill="#3A2618" />
        <rect x="36" y="38" width="7" height="20" rx="2" fill="#3A2618" />
        {/* torso — broad */}
        <rect x="22" y="26" width="28" height="18" rx="3" fill="#4B321F" />
        {/* iron chest plate */}
        <rect x="25" y="27" width="22" height="14" rx="2" fill="#383D3F" />
        <line x1="36" y1="27" x2="36" y2="41" stroke="#5A5F61" strokeWidth="1" />
        {/* heavy cloak */}
        <path d="M20 30 Q14 44 18 58 L26 58 L26 38 Z" fill="#2A1A10" opacity="0.85" />
        <path d="M52 30 Q58 44 54 58 L46 58 L46 38 Z" fill="#2A1A10" opacity="0.85" />
        {/* arms */}
        <rect x="13" y="28" width="10" height="22" rx="3" fill="#3A2618" />
        <rect x="49" y="28" width="10" height="22" rx="3" fill="#3A2618" />
        {/* shield on left arm */}
        <rect x="9" y="32" width="10" height="13" rx="2" fill="#383D3F" />
        <rect x="10" y="33" width="8" height="11" rx="1" fill="#5A5F61" />
        {/* dent on shield */}
        <line x1="14" y1="34" x2="14" y2="43" stroke="#2F3437" strokeWidth="1.5" />
        {/* neck */}
        <rect x="31" y="20" width="10" height="8" rx="2" fill="#3A2618" />
        {/* head */}
        <rect x="27" y="10" width="18" height="16" rx="4" fill="#C8B88A" />
        {/* helmet */}
        <rect x="25" y="8" width="22" height="9" rx="3" fill="#383D3F" />
        <rect x="25" y="8" width="22" height="4" rx="2" fill="#5A5F61" />
        {/* visor slit */}
        <rect x="29" y="12" width="14" height="2" rx="1" fill="#070807" />
        {/* farol right hand */}
        <rect x="55" y="36" width="5" height="8" rx="1" fill="#B8944A" />
        <rect x="56" y="37" width="3" height="5" rx="0.5" fill="#D46A2D" opacity="0.9" />
        <ellipse cx="57.5" cy="44" rx="2.5" ry="1" fill="#D46A2D" opacity="0.4" className="flicker" />
      </svg>
    )
  }

  if (archetypeId === 'runario') {
    return (
      <svg width={s} height={s} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="36" cy="66" rx="14" ry="3.5" fill="rgba(0,0,0,0.35)" />
        {/* robe hem */}
        <path d="M24 52 Q28 66 36 66 Q44 66 48 52 Z" fill="#3A2618" />
        {/* robe body */}
        <rect x="23" y="30" width="26" height="26" rx="4" fill="#2A1A10" />
        {/* violet inner robe */}
        <rect x="27" y="31" width="18" height="24" rx="2" fill="#1A1428" />
        {/* arms — thin */}
        <rect x="13" y="30" width="11" height="18" rx="3" fill="#2A1A10" />
        <rect x="48" y="30" width="11" height="18" rx="3" fill="#2A1A10" />
        {/* neck */}
        <rect x="31" y="22" width="10" height="10" rx="2" fill="#2A1A10" />
        {/* head */}
        <ellipse cx="36" cy="17" rx="9" ry="10" fill="#C8B88A" />
        {/* deep hood */}
        <path d="M22 14 Q22 2 36 2 Q50 2 50 14 L46 24 L36 26 L26 24 Z" fill="#1A1428" />
        <ellipse cx="36" cy="17" rx="7" ry="8" fill="#C8B88A" opacity="0.6" />
        {/* face shadow in hood */}
        <ellipse cx="36" cy="17" rx="5" ry="6" fill="#2A1A10" opacity="0.5" />
        {/* staff left */}
        <rect x="11" y="20" width="3" height="42" rx="1.5" fill="#4B321F" />
        <ellipse cx="12.5" cy="20" rx="4" ry="4" fill="#6D5A9C" opacity="0.7" />
        <ellipse cx="12.5" cy="20" rx="2" ry="2" fill="#9B7FD4" opacity="0.5" />
        {/* talismán chest */}
        <ellipse cx="36" cy="36" rx="4" ry="4" fill="#4B321F" />
        <ellipse cx="36" cy="36" rx="2.5" ry="2.5" fill="#6D5A9C" opacity="0.6" />
        {/* runes on robe */}
        <text x="30" y="48" fontSize="5" fill="#6D5A9C" opacity="0.7" fontFamily="serif">ᚱᚢᚾ</text>
        {/* scroll right hand */}
        <rect x="51" y="36" width="7" height="10" rx="2" fill="#C8B88A" opacity="0.7" />
        <line x1="53" y1="38" x2="57" y2="38" stroke="#B8944A" strokeWidth="0.7" />
        <line x1="53" y1="40" x2="57" y2="40" stroke="#B8944A" strokeWidth="0.7" />
        <line x1="53" y1="42" x2="57" y2="42" stroke="#B8944A" strokeWidth="0.7" />
      </svg>
    )
  }

  // rastreador
  return (
    <svg width={s} height={s} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="36" cy="66" rx="13" ry="3" fill="rgba(0,0,0,0.3)" />
      {/* boots */}
      <rect x="27" y="56" width="7" height="10" rx="2" fill="#2A1A10" />
      <rect x="36" y="56" width="7" height="10" rx="2" fill="#2A1A10" />
      {/* legs */}
      <rect x="28" y="40" width="6" height="18" rx="2" fill="#3A2618" />
      <rect x="36" y="40" width="6" height="18" rx="2" fill="#3A2618" />
      {/* torso — slender */}
      <rect x="25" y="26" width="22" height="18" rx="3" fill="#2A3018" />
      {/* long cloak */}
      <path d="M22 28 Q15 46 20 62 L28 62 L28 40 Z" fill="#1A2410" opacity="0.9" />
      <path d="M50 28 Q57 46 52 62 L44 62 L44 40 Z" fill="#1A2410" opacity="0.9" />
      {/* arms — lean */}
      <rect x="14" y="28" width="12" height="18" rx="3" fill="#2A3018" />
      <rect x="46" y="28" width="12" height="18" rx="3" fill="#2A3018" />
      {/* knife in right hand */}
      <rect x="57" y="38" width="2.5" height="10" rx="1" fill="#5A5F61" />
      <rect x="56.5" y="36" width="3.5" height="3" rx="0.5" fill="#383D3F" />
      {/* rope coil left hand */}
      <ellipse cx="16" cy="44" rx="5" ry="4" fill="none" stroke="#C8B88A" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="16" cy="44" rx="3" ry="2.5" fill="none" stroke="#C8B88A" strokeWidth="1" opacity="0.4" />
      {/* neck */}
      <rect x="31" y="20" width="10" height="8" rx="2" fill="#2A3018" />
      {/* head */}
      <ellipse cx="36" cy="15" rx="9" ry="10" fill="#C8B88A" />
      {/* hood / cowl long */}
      <path d="M24 12 Q24 4 36 4 Q48 4 48 12 L44 22 L36 24 L28 22 Z" fill="#1A2410" />
      <path d="M28 22 Q28 16 36 16 Q44 16 44 22 Z" fill="#C8B88A" opacity="0.35" />
      {/* eyes */}
      <ellipse cx="32" cy="15" rx="1.5" ry="1.5" fill="#070807" />
      <ellipse cx="40" cy="15" rx="1.5" ry="1.5" fill="#070807" />
      {/* map roll on back */}
      <rect x="43" y="25" width="5" height="12" rx="2" fill="#C8B88A" opacity="0.5" />
      <line x1="43" y1="29" x2="48" y2="29" stroke="#B8944A" strokeWidth="0.6" opacity="0.7" />
      <line x1="43" y1="32" x2="48" y2="32" stroke="#B8944A" strokeWidth="0.6" opacity="0.7" />
    </svg>
  )
}
