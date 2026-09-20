import { useEffect, useRef } from "react";
import { PawMeadowScene } from "./PawMeadowScene";
import type { MovementInput } from "./input/MovementInput";

export function GameCanvas({ input }: { input: MovementInput }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new PawMeadowScene(canvasRef.current, input);
    game.start();
    return () => game.dispose();
  }, [input]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Paw Meadow 3D scene" />;
}
