import { useState } from 'react'
import { CREATURES } from '../data/gameData.js'
import ChoiceCard    from '../components/ChoiceCard.jsx'
import CreatureToken from '../components/tokens/CreatureToken.jsx'
import ClassSelectScreen from './ClassSelectScreen.jsx'

// ── Partida guardada ──────────────────────────────────────────────────────────

function SavedGameScreen({ onContinue, onNewGame }) {
  function handleNewGame() {
    if (window.confirm('Esto borrará la caravana guardada y empezará una nueva partida. ¿Continuar?'))
      onNewGame()
  }

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Aethermarch</h1>
        <p className="tagline">Cada paseo real hace avanzar tu caravana por un mundo medieval misterioso.</p>
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
          <button className="btn btn-primary" onClick={onContinue} style={{ width: '100%', marginBottom: 10 }}>
            Continuar partida
          </button>
          <button onClick={handleNewGame} style={{
            background: 'transparent', border: '1px solid var(--color-iron-dark)',
            color: 'var(--color-stone-light)', fontFamily: 'inherit', fontSize: '0.75rem',
            padding: '8px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            width: '100%', letterSpacing: '0.04em',
          }}>
            Nueva partida
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Selección de criatura ─────────────────────────────────────────────────────

function CreatureSelectScreen({ archetypeId, onStart, onBack }) {
  const [creatureId, setCreatureId] = useState(null)

  return (
    <div className="start-screen">
      <div className="start-hero" style={{ paddingBottom: 8 }}>
        <h1>Aethermarch</h1>
        <p className="tagline">Elige a tu compañero de ruta.</p>
      </div>

      <div className="start-body">
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
          onClick={() => onStart({ archetypeId, creatureId })}
          disabled={!creatureId}
        >
          Entrar a la caravana
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--color-stone-light)', fontSize: '0.75rem',
            cursor: 'pointer', padding: '8px', marginTop: 4,
            letterSpacing: '0.04em',
          }}
        >
          ← Cambiar aventurero
        </button>
        {!creatureId && (
          <p className="start-hint">Elige una criatura para continuar.</p>
        )}
      </div>
    </div>
  )
}

// ── Pantalla principal ────────────────────────────────────────────────────────

export default function StartScreen({ onStart, hasSave, onContinue, onNewGame }) {
  const [step,        setStep]        = useState('class')
  const [archetypeId, setArchetypeId] = useState(null)

  if (hasSave) return <SavedGameScreen onContinue={onContinue} onNewGame={onNewGame} />

  if (step === 'class') {
    return (
      <ClassSelectScreen
        onSelect={(id) => { setArchetypeId(id); setStep('creature') }}
      />
    )
  }

  return (
    <CreatureSelectScreen
      archetypeId={archetypeId}
      onStart={onStart}
      onBack={() => setStep('class')}
    />
  )
}
