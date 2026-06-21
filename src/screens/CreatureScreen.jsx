import { CREATURES } from '../data/gameData.js'
import CreatureToken from '../components/tokens/CreatureToken.jsx'
import StatBar from '../components/StatBar.jsx'

export default function CreatureScreen({ player }) {
  const creature = CREATURES.find(c => c.id === player?.creatureId)

  if (!creature) {
    return (
      <div className="screen-scroll">
        <div className="panel">
          <div className="panel-title">Criaturas disponibles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CREATURES.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CreatureToken creatureId={c.id} size={64} />
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-parchment)', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-ember)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.role}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-magic)', marginBottom: 2 }}>{c.passiveName}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-stone-light)' }}>{c.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-scroll" style={{ padding: 0 }}>

      <div className="creature-screen-hero">
        <div className="float">
          <CreatureToken creatureId={creature.id} size={110} />
        </div>
        <div className="creature-hero-name">{creature.name}</div>
        <div className="creature-hero-role">{creature.role}</div>
        <div className="creature-hero-desc">{creature.description}</div>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div className="panel">
          <div className="panel-title">Pasiva</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-magic)', marginBottom: 4 }}>{creature.passiveName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-stone-light)', lineHeight: 1.5 }}>{creature.passiveDescription}</div>
        </div>

        <div className="panel">
          <div className="panel-title">Vínculo</div>
          <div className="bond-bar-wrap">
            <div className="bond-label">Vínculo</div>
            <div className="stat-bar-wrap">
              <StatBar label="Vín" value={0} max={100} type="xp" />
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--color-stone-light)', fontStyle: 'italic' }}>
            El vínculo crece con cada expedición compartida.
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Otras criaturas</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-stone-light)', lineHeight: 1.5, fontStyle: 'italic' }}>
            Más criaturas podrán unirse a la caravana en el futuro.<br />
            Cada una requiere materiales específicos del mundo.
          </div>
        </div>

      </div>
    </div>
  )
}
