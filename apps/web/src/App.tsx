import { useCallback, useRef, useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { TargetPanel } from "./game/TargetPanel";
import { VirtualJoystick } from "./game/VirtualJoystick";
import { MovementInput } from "./game/input/MovementInput";
import type { TargetSummary } from "./game/targeting/TargetingTypes";
import type { CombatResultPayload } from "@nekoria/protocol";

const skills = ["⚔", "✦", "✧", "✚"];

export function App() {
  const input = useRef(new MovementInput()).current;
  const [target, setTarget] = useState<TargetSummary | null>(null);
  const [clearTargetRequest, setClearTargetRequest] = useState(0);
  const [attackRequest, setAttackRequest] = useState(0);
  const [progress, setProgress] = useState({ level: 1, exp: 0, expToNextLevel: 60, statusPoints: 0, hp: 100 });
  const [combatText, setCombatText] = useState<{ id: number; text: string } | null>(null);
  const handleTargetChange = useCallback((nextTarget: TargetSummary | null) => setTarget(nextTarget), []);
  const clearTarget = useCallback(() => setClearTargetRequest((request) => request + 1), []);
  const handleCombatResult = useCallback((result: CombatResultPayload) => {
    setProgress({ level: result.level, exp: result.exp, expToNextLevel: result.expToNextLevel, statusPoints: result.statusPoints, hp: result.playerHp });
    const text = result.outcome === "MISS" ? "MISS" : `${result.outcome === "CRIT" ? "CRIT " : ""}${result.damage}`;
    setCombatText((current) => ({ id: (current?.id ?? 0) + 1, text }));
  }, []);

  return (
    <main className="game-shell">
      <GameCanvas input={input} clearTargetRequest={clearTargetRequest} attackRequest={attackRequest} onTargetChange={handleTargetChange} onCombatResult={handleCombatResult} />

      <section className="brand-card">
        <span className="brand-mark">●</span>
        <div><small>NEKORIA</small><h1>Paw Meadow</h1><span>Visual Benchmark v0.5</span></div>
      </section>

      <section className="map-card">
        <small>EXPLORATION AREA</small><strong>Paw Meadow</strong><span>Lv. 1–8 · Daylight</span>
      </section>

      {target && <TargetPanel target={target} onClear={clearTarget} />}
      <section className="progress-card"><strong>Base Lv. {progress.level}</strong><span>HP {progress.hp}/100</span><span>EXP {progress.exp}/{progress.expToNextLevel}</span><span>Points {progress.statusPoints}</span></section>
      {combatText && <div className="combat-text" key={combatText.id}>{combatText.text}</div>}

      <VirtualJoystick input={input} />

      <nav className="action-bar" aria-label="Action controls preview">
        {skills.map((icon, index) => <button key={icon} type="button" disabled aria-label={`Skill ${index + 1}`}>{icon}<kbd>{index + 1}</kbd></button>)}
        <button className="attack-button" type="button" onClick={() => setAttackRequest((request) => request + 1)} aria-label="Basic attack">ATK</button>
      </nav>

      <button className="auto-button" type="button" disabled>AUTO</button>
      <div className="prototype-badge">EXPLORE · LOCK · BATTLE</div>
    </main>
  );
}
