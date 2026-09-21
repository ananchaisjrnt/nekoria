import { useEffect, useRef } from "react";
import { PawMeadowScene } from "./PawMeadowScene";
import type { MovementInput } from "./input/MovementInput";
import type { TargetSummary } from "./targeting/TargetingTypes";
import type { CombatResultPayload, InventorySnapshotPayload } from "@nekoria/protocol";

interface GameCanvasProps {
  input: MovementInput;
  clearTargetRequest: number;
  attackRequest: number;
  pickupRequest: number;
  onTargetChange: (target: TargetSummary | null) => void;
  onCombatResult: (result: CombatResultPayload) => void;
  onInventorySnapshot: (snapshot: InventorySnapshotPayload) => void;
  onPickupFeedback: (text: string) => void;
  onPickupAvailability: (available: boolean) => void;
}

export function GameCanvas({ input, clearTargetRequest, attackRequest, pickupRequest, onTargetChange, onCombatResult, onInventorySnapshot, onPickupFeedback, onPickupAvailability }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PawMeadowScene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new PawMeadowScene(canvasRef.current, input, onTargetChange, onCombatResult, onInventorySnapshot, onPickupFeedback, onPickupAvailability);
    gameRef.current = game;
    game.start();
    return () => { gameRef.current = null; game.dispose(); };
  }, [input, onTargetChange, onCombatResult]);

  useEffect(() => {
    if (clearTargetRequest > 0) gameRef.current?.clearTarget();
  }, [clearTargetRequest]);

  useEffect(() => {
    if (attackRequest > 0) gameRef.current?.requestAttack();
  }, [attackRequest]);

  useEffect(() => {
    if (pickupRequest > 0) gameRef.current?.requestPickup();
  }, [pickupRequest]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Paw Meadow 3D scene" />;
}
