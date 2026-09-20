import { useEffect, useRef } from "react";
import { PawMeadowScene } from "./PawMeadowScene";
import type { MovementInput } from "./input/MovementInput";
import type { TargetSummary } from "./targeting/TargetingTypes";

interface GameCanvasProps {
  input: MovementInput;
  clearTargetRequest: number;
  attackRequest: number;
  onTargetChange: (target: TargetSummary | null) => void;
}

export function GameCanvas({ input, clearTargetRequest, attackRequest, onTargetChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PawMeadowScene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new PawMeadowScene(canvasRef.current, input, onTargetChange);
    gameRef.current = game;
    game.start();
    return () => { gameRef.current = null; game.dispose(); };
  }, [input, onTargetChange]);

  useEffect(() => {
    if (clearTargetRequest > 0) gameRef.current?.clearTarget();
  }, [clearTargetRequest]);

  useEffect(() => {
    if (attackRequest > 0) gameRef.current?.requestAttack();
  }, [attackRequest]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Paw Meadow 3D scene" />;
}
