import { useCallback, useRef, useState } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { TargetPanel } from "./game/TargetPanel";
import { VirtualJoystick } from "./game/VirtualJoystick";
import { MovementInput } from "./game/input/MovementInput";
import type { TargetSummary } from "./game/targeting/TargetingTypes";

const skills = ["⚔", "✦", "✧", "✚"];

export function App() {
  const input = useRef(new MovementInput()).current;
  const [target, setTarget] = useState<TargetSummary | null>(null);
  const [clearTargetRequest, setClearTargetRequest] = useState(0);
  const [attackRequest, setAttackRequest] = useState(0);
  const handleTargetChange = useCallback((nextTarget: TargetSummary | null) => setTarget(nextTarget), []);
  const clearTarget = useCallback(() => setClearTargetRequest((request) => request + 1), []);

  return (
    <main className="game-shell">
      <GameCanvas input={input} clearTargetRequest={clearTargetRequest} attackRequest={attackRequest} onTargetChange={handleTargetChange} />

      <section className="brand-card">
        <span className="brand-mark">●</span>
        <div><small>NEKORIA</small><h1>Paw Meadow</h1><span>Movement v0.2</span></div>
      </section>

      <section className="map-card">
        <small>EXPLORATION AREA</small><strong>Paw Meadow</strong><span>Lv. 1–8 · Daylight</span>
      </section>

      {target && <TargetPanel target={target} onClear={clearTarget} />}

      <VirtualJoystick input={input} />

      <nav className="action-bar" aria-label="Action controls preview">
        {skills.map((icon, index) => <button key={icon} type="button" disabled aria-label={`Skill ${index + 1}`}>{icon}<kbd>{index + 1}</kbd></button>)}
        <button className="attack-button" type="button" onClick={() => setAttackRequest((request) => request + 1)} aria-label="Basic attack">ATK</button>
      </nav>

      <button className="auto-button" type="button" disabled>AUTO</button>
      <div className="prototype-badge">TAP A SLIME TO LOCK TARGET</div>
    </main>
  );
}
