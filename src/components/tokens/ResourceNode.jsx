export default function ResourceNode({ resourceId, size = 48 }) {
  const s = size

  const nodes = {
    runic_wood: (
      // curved branch with golden rune
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M14 40 Q16 28 22 20 Q28 12 32 8" stroke="#4B321F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M22 20 Q18 16 16 10" stroke="#3A2618" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M28 14 Q32 10 36 12" stroke="#3A2618" strokeWidth="2" strokeLinecap="round" fill="none" />
        <text x="18" y="32" fontSize="9" fill="#B8944A" opacity="0.8" fontFamily="serif">ᚱ</text>
        <ellipse cx="14" cy="41" rx="6" ry="2" fill="rgba(0,0,0,0.25)" />
      </svg>
    ),
    aethel_root: (
      // S-shaped root with magic tip
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M24 42 Q32 36 28 28 Q24 20 32 14 Q36 10 34 6" stroke="#4B321F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M24 42 Q16 38 18 32" stroke="#3A2618" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M26 28 Q20 26 18 22" stroke="#3A2618" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <ellipse cx="34" cy="6" rx="3" ry="3" fill="#4F8F95" opacity="0.6" />
        <ellipse cx="34" cy="6" rx="1.5" ry="1.5" fill="#9BE0E8" opacity="0.4" />
        <ellipse cx="24" cy="43" rx="6" ry="2" fill="rgba(0,0,0,0.2)" />
      </svg>
    ),
    lumi_leaf: (
      // lanceolate leaf with gold edge
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M24 44 Q10 34 12 18 Q14 6 24 4 Q34 6 36 18 Q38 34 24 44 Z" fill="#2A3018" />
        <path d="M24 44 Q10 34 12 18 Q14 6 24 4" stroke="#B8944A" strokeWidth="0.8" opacity="0.7" fill="none" />
        <path d="M24 44 Q38 34 36 18 Q34 6 24 4" stroke="#B8944A" strokeWidth="0.8" opacity="0.7" fill="none" />
        <line x1="24" y1="44" x2="24" y2="4" stroke="#3A4020" strokeWidth="1" opacity="0.6" />
        <line x1="24" y1="20" x2="16" y2="14" stroke="#3A4020" strokeWidth="0.7" opacity="0.5" />
        <line x1="24" y1="26" x2="32" y2="20" stroke="#3A4020" strokeWidth="0.7" opacity="0.5" />
        <ellipse cx="24" cy="45" rx="5" ry="1.5" fill="rgba(0,0,0,0.2)" />
      </svg>
    ),
    arcane_salt: (
      // salt crystal cluster
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="18" y="34" width="12" height="8" rx="2" fill="#C8B88A" opacity="0.6" />
        <path d="M20 34 L18 24 L24 30 Z" fill="#D4CCBC" opacity="0.7" />
        <path d="M24 34 L22 20 L28 28 Z" fill="#C8B88A" opacity="0.75" />
        <path d="M28 34 L26 22 L32 32 Z" fill="#D4CCBC" opacity="0.65" />
        <path d="M32 36 L31 26 L36 34 Z" fill="#C8B88A" opacity="0.6" />
        <ellipse cx="24" cy="44" rx="10" ry="2.5" fill="rgba(0,0,0,0.2)" />
      </svg>
    ),
    tide_crystal: (
      // triangular crystal on rock base
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="40" rx="10" ry="5" fill="#2F3437" />
        <ellipse cx="24" cy="40" rx="8" ry="3.5" fill="#383D3F" />
        <path d="M24 6 L14 38 L34 38 Z" fill="#4F8F95" opacity="0.55" />
        <path d="M24 6 L19 38 L29 38 Z" fill="#6FAFB5" opacity="0.35" />
        <path d="M24 6 L14 38" stroke="#4F8F95" strokeWidth="0.7" opacity="0.4" />
        <path d="M24 6 L34 38" stroke="#4F8F95" strokeWidth="0.7" opacity="0.4" />
        {/* gleam */}
        <path d="M24 10 L22 18 L24 16 Z" fill="white" opacity="0.2" />
      </svg>
    ),
    nacre_scale: (
      // teardrop curve scale
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M24 6 Q38 14 36 30 Q34 42 24 44 Q14 42 12 30 Q10 14 24 6 Z" fill="#C8B88A" opacity="0.55" />
        <path d="M24 8 Q36 16 34 30 Q32 40 24 42" stroke="#B8944A" strokeWidth="0.7" opacity="0.5" fill="none" />
        <path d="M24 12 Q34 20 32 32 Q30 40 24 42" fill="#4F8F95" opacity="0.15" />
        <path d="M24 16 Q30 22 28 32 Q26 38 24 40" fill="#6D5A9C" opacity="0.1" />
        <ellipse cx="24" cy="45" rx="6" ry="1.5" fill="rgba(0,0,0,0.2)" />
      </svg>
    ),
    forge_mineral: (
      // angular rock with metallic vein and ember crack
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <path d="M10 38 L14 18 L24 12 L38 20 L40 36 L24 44 Z" fill="#2F3437" />
        <path d="M14 18 L24 12 L38 20" fill="#383D3F" opacity="0.6" />
        <path d="M20 28 L28 16 L34 24" stroke="#5A5F61" strokeWidth="1.5" opacity="0.7" fill="none" />
        {/* ember crack */}
        <path d="M18 32 L22 24 L24 30 L28 20 L30 28" stroke="#D46A2D" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        <ellipse cx="24" cy="45" rx="9" ry="2.5" fill="rgba(0,0,0,0.3)" />
      </svg>
    ),
    ancient_plate: (
      // oxidized metal plate with rivets
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <rect x="8" y="16" width="32" height="24" rx="2" fill="#383D3F" />
        <rect x="10" y="18" width="28" height="20" rx="1" fill="#2F3437" />
        {/* scratch */}
        <path d="M16 22 L36 38" stroke="#5A5F61" strokeWidth="1" opacity="0.5" />
        {/* rivets */}
        <circle cx="13" cy="21" r="2" fill="#5A5F61" />
        <circle cx="35" cy="21" r="2" fill="#5A5F61" />
        <circle cx="13" cy="35" r="2" fill="#5A5F61" />
        <circle cx="35" cy="35" r="2" fill="#5A5F61" />
        {/* rust patches */}
        <ellipse cx="22" cy="28" rx="4" ry="3" fill="#8A3F1D" opacity="0.3" />
        <ellipse cx="30" cy="32" rx="3" ry="2" fill="#8A3F1D" opacity="0.25" />
        <ellipse cx="24" cy="42" rx="8" ry="2" fill="rgba(0,0,0,0.25)" />
      </svg>
    ),
    resonant_coal: (
      // black irregular rock with ember crack and smoke
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        {/* smoke wisps */}
        <path d="M20 14 Q18 8 22 4" stroke="#626B6F" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M26 12 Q24 6 28 2" stroke="#626B6F" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
        <path d="M10 38 L16 20 L28 14 L40 22 L38 40 L22 44 Z" fill="#1A1A1A" />
        <path d="M16 20 L28 14 L40 22" fill="#222222" opacity="0.7" />
        {/* ember glow crack */}
        <path d="M16 32 L22 22 L24 28 L30 18 L32 26" stroke="#D46A2D" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75" />
        <ellipse cx="24" cy="22" rx="3" ry="2" fill="#D46A2D" opacity="0.2" />
        <ellipse cx="24" cy="45" rx="8" ry="2" fill="rgba(0,0,0,0.3)" />
      </svg>
    ),
  }

  return nodes[resourceId] ?? (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="12" y="12" width="24" height="24" rx="4" fill="#383D3F" />
      <text x="18" y="30" fontSize="14" fill="#626B6F">?</text>
    </svg>
  )
}
