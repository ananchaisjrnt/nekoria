import { useRef } from "react";
import { GameCanvas } from "./game/GameCanvas";
import { VirtualJoystick } from "./game/VirtualJoystick";
import { MovementInput } from "./game/input/MovementInput";

const skills = ["⚔", "✦", "✧", "✚"];

export function App() {
  const input = useRef(new MovementInput()).current;

  return (
    <main className="game-shell">
      <GameCanvas input={input} />

      <section className="brand-card">
        <span className="brand-mark">●</span>
        <div><small>NEKORIA</small><h1>Paw Meadow</h1><span>Movement v0.2</span></div>
      </section>

      <section className="map-card">
        <small>EXPLORATION AREA</small><strong>Paw Meadow</strong><span>Lv. 1–8 · Daylight</span>
      </section>

      <VirtualJoystick input={input} />

      <nav className="action-bar" aria-label="Action controls preview">
        {skills.map((icon, index) => <button key={icon} type="button" disabled aria-label={`Skill ${index + 1}`}>{icon}<kbd>{index + 1}</kbd></button>)}
        <button className="attack-button" type="button" disabled aria-label="Basic attack">ATK</button>
      </nav>

      <button className="auto-button" type="button" disabled>AUTO</button>
      <div className="prototype-badge">TAP THE GROUND OR USE THE JOYSTICK</div>
    </main>
  );
}
