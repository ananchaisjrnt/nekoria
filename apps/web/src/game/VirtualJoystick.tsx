import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { MovementInput } from "./input/MovementInput";

interface VirtualJoystickProps {
  input: MovementInput;
}

export function VirtualJoystick({ input }: VirtualJoystickProps) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activePointer = useRef<number | null>(null);

  const update = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = bounds.width / 2;
    let x = (event.clientX - (bounds.left + radius)) / radius;
    let y = (event.clientY - (bounds.top + radius)) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    setKnob({ x, y });
    input.setJoystick(x, -y);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (activePointer.current === event.pointerId) update(event);
  };

  const release = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    input.releaseJoystick();
  };

  return (
    <div
      className="joystick"
      role="application"
      aria-label="Movement joystick"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div
        className="joystick__knob"
        style={{ transform: `translate(${knob.x * 27}px, ${knob.y * 27}px)` }}
      />
    </div>
  );
}
