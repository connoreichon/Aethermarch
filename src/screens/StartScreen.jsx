import { useState } from 'react'
import { ARCHETYPES, CREATURES } from '../data/gameData.js'
import ChoiceCard     from '../components/ChoiceCard.jsx'
import ArchetypeToken from '../components/tokens/ArchetypeToken.jsx'
import CreatureToken  from '../components/tokens/CreatureToken.jsx'

// ── Vista cuando existe partida guardada ──────────────────────────────────────

function SavedGameScreen({ onContinue, onNewGame }) {
  function handleNewGame() {
    const confirmed = window.confirm(
      'Esto borrará la caravana guardada y empezará una nueva partida. ¿Continuar?'
    )
    if (confirmed) onNewGame()
  }

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Aethermarch</h1>
        <p className="tagline">
          Cada paseo real hace avanzar tu caravana por un mundo medieval misterioso.
        </p>
      </div>

      <div className="start-body" style={{ maxWidth: 360, margin: '0 auto' }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-stone-light)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Partida guardada encontrada
          </div>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ margin: '0 auto 14px', display: 'block' }}>
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(184,148,74,0.4)" strokeWidth="1"/>
            <circle cx="28" cy="28" r="21" fill="rgba(26,18,8,0.9)" stroke="rgba(184,148,74,0.2)" strokeWidth="0.5"/>
            <path d="M20 36 L20 22 L28 16 L36 22 L36 36 Z" fill="none" stroke="rgba(184,148,74,0.55)" strokeWidth="1.2" strokeLinejoin="round"/>
            <rect x="24" y="28" width="8" height="8" fill="none" stroke="rgba(184,148,74,0.45)" strokeWidth="1"/>
            <path d="M28 18 L28 22" stroke="rgba(184,148,74,0.4)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <button
            className="btn btn-primary"
            onClick={onContinue}
            style={{ width: '100%', marginBottom: 10 }}
          >
            Continuar partida
          </button>
          <button
            onClick={handleNewGame}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-iron-dark)',
              color: 'var(--color-stone-light)',
              fontFamily: 'inherit',
              fontSize: '0.75rem',
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              width: '100%',
              letterSpacing: '0.04em',
            }}
          >
            Nueva partida
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vista de selección inicial ────────────────────────────────────────────────

export default function StartScreen({ onStart, hasSave, onContinue, onNewGame }) {
  const [archetypeId, setArchetypeId] = useState(null)
  const [creatureId,  setCreatureId]  = useState(null)

  // Show save-continue screen if a save exists
  if (hasSave) {
    return <SavedGameScreen onContinue={onContinue} onNewGame={onNewGame} />
  }

  const canStart = archetypeId !== null && creatureId !== null

  function handleStart() {
    if (!canStart) return
    onStart({ archetypeId, creatureId })
  }

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Aethermarch</h1>
        <p className="tagline">
          Cada paseo real hace avanzar tu caravana por un mundo medieval misterioso.
        </p>
      </div>

      <div className="start-body">

        {/* ARQUETIPO */}
        <div>
          <div className="start-section-title">Elige tu arquetipo</div>
          <div className="choice-grid">
            {ARCHETYPES.map(a => (
              <ChoiceCard
                key={a.id}
                selected={archetypeId === a.id}
                onClick={() => setArchetypeId(a.id)}
                tokenSlot={<ArchetypeToken archetypeId={a.id} size={72} />}
                name={a.name}
                role={a.role}
                passiveName={a.passiveName}
                passiveDescription={a.passiveDescription}
              />
            ))}
          </div>
        </div>

        <div className="rune-divider">· · ᚢ · ·</div>

        {/* CRIATURA */}
        <div>
          <div className="start-section-title">Elige tu criatura</div>
          <div className="choice-grid">
            {CREATURES.map(c => (
              <ChoiceCard
                key={c.id}
                selected={creatureId === c.id}
                onClick={() => setCreatureId(c.id)}
                tokenSlot={<CreatureToken creatureId={c.id} size={72} />}
                name={c.name}
                role={c.role}
                passiveName={c.passiveName}
                passiveDescription={c.passiveDescription}
                description={c.description}
              />
            ))}
          </div>
        </div>

      </div>

      <div className="start-actions">
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={!canStart}
        >
          Entrar a la caravana
        </button>
        {!canStart && (
          <p className="start-hint">
            {!archetypeId && !creatureId
              ? 'Elige un arquetipo y una criatura para continuar.'
              : !archetypeId
              ? 'Elige un arquetipo para continuar.'
              : 'Elige una criatura para continuar.'}
          </p>
        )}
      </div>
    </div>
  )
}
