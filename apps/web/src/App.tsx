import { GameCanvas } from "./game/GameCanvas";

const skills = ["⚔", "✦", "✧", "✚"];

export function App() {
  return (
    <main className="game-shell">
      <GameCanvas />

      <section className="brand-card">
        <span className="brand-mark">●</span>
        <div><small>NEKORIA</small><h1>Paw Meadow</h1><span>Prototype v0.1</span></div>
      </section>

      <section className="map-card">
        <small>EXPLORATION AREA</small><strong>Paw Meadow</strong><span>Lv. 1–8 · Daylight</span>
      </section>

      <div className="joystick" aria-label="Movement control preview">
        <div className="joystick__knob" />
      </div>

      <nav className="action-bar" aria-label="Action controls preview">
        {skills.map((icon, index) => <button key={icon} type="button" disabled aria-label={`Skill ${index + 1}`}>{icon}<kbd>{index + 1}</kbd></button>)}
        <button className="attack-button" type="button" disabled aria-label="Basic attack">ATK</button>
      </nav>

      <button className="auto-button" type="button" disabled>AUTO</button>
      <div className="prototype-badge">CONTROL PREVIEW · MOVEMENT IS NEXT</div>
    </main>
  );
}

