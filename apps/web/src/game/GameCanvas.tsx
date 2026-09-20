import { useEffect, useRef } from "react";
import { PawMeadowScene } from "./PawMeadowScene";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new PawMeadowScene(canvasRef.current);
    game.start();
    return () => game.dispose();
  }, []);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Paw Meadow 3D scene" />;
}

