import type { TargetSummary } from "./targeting/TargetingTypes";

interface TargetPanelProps {
  target: TargetSummary;
  onClear: () => void;
}

export function TargetPanel({ target, onClear }: TargetPanelProps) {
  const hpPercent = (target.currentHp / target.maxHp) * 100;

  return (
    <section className="target-panel" aria-label={`Target: ${target.displayName}`}>
      <div className="target-panel__heading">
        <div><small>LOCKED TARGET</small><strong>{target.displayName}</strong></div>
        <button type="button" onClick={onClear} aria-label="Clear target">×</button>
      </div>
      <div className="target-panel__details"><span>Lv. {target.level}</span><span>{target.currentHp} / {target.maxHp} HP</span></div>
      <div className="target-panel__bar" aria-label={`${target.currentHp} of ${target.maxHp} health`}>
        <div style={{ width: `${hpPercent}%` }} />
      </div>
    </section>
  );
}
