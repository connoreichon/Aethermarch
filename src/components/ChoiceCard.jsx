export default function ChoiceCard({ selected, onClick, tokenSlot, name, role, passiveName, passiveDescription, description }) {
  return (
    <div className={`choice-card${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ flexShrink: 0 }}>{tokenSlot}</div>
      <div className="choice-card-info">
        <div className="choice-card-name">{name}</div>
        <div className="choice-card-role">{role}</div>
        {passiveName && (
          <div className="choice-card-passive-name">— {passiveName}</div>
        )}
        {passiveDescription && (
          <div className="choice-card-passive-desc">{passiveDescription}</div>
        )}
        {description && (
          <div className="choice-card-desc">{description}</div>
        )}
      </div>
    </div>
  )
}
