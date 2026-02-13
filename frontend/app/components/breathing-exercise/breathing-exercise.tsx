"use client";

import { useEffect, useMemo, useState } from "react";
import style from "./breathing-exercise.module.css";

type PhaseKey = "inhale" | "hold" | "exhale";

type BreathingExerciseProps = {
  show: boolean;
};

const PHASES: Array<{ key: PhaseKey; label: string; seconds: number }> = [
  { key: "inhale", label: "Inhale through your nose", seconds: 4 },
  { key: "hold", label: "Hold your breath", seconds: 7 },
  { key: "exhale", label: "Exhale slowly through your mouth", seconds: 8 },
];

export default function BreathingExercise({ show }: BreathingExerciseProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  const currentPhase = PHASES[phaseIndex];
  const phasePercent = useMemo(
    () => ((currentPhase.seconds - secondsLeft) / currentPhase.seconds) * 100,
    [currentPhase.seconds, secondsLeft],
  );

  useEffect(() => {
    if (!show) {
      setIsRunning(false);
      setPhaseIndex(0);
      setSecondsLeft(PHASES[0].seconds);
      setRoundsCompleted(0);
    }
  }, [show]);

  useEffect(() => {
    if (!isRunning || !show) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous > 1) {
          return previous - 1;
        }

        setPhaseIndex((currentIndex) => {
          const nextIndex = (currentIndex + 1) % PHASES.length;
          if (nextIndex === 0) {
            setRoundsCompleted((count) => count + 1);
          }
          return nextIndex;
        });

        return previous;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, show]);

  useEffect(() => {
    if (!show) return;
    setSecondsLeft(PHASES[phaseIndex].seconds);
  }, [phaseIndex, show]);

  if (!show) return null;

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
    setRoundsCompleted(0);
  };

  return (
    <section className={style.container}>
      <div className={style.headerRow}>
        <h3 className={style.title}>Calming Breath (4-7-8)</h3>
        <span className={style.rounds}>Rounds: {roundsCompleted}</span>
      </div>

      <p className={style.subtitle}>
        Follow the visual guide: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.
      </p>

      <div className={style.animationArea}>
        <div
          className={`${style.breathOrb} ${style[currentPhase.key]}`}
          style={{ ["--phase-duration" as string]: `${currentPhase.seconds}s` }}
        />
        <div className={style.phaseInfo}>
          <span className={style.phaseLabel}>{currentPhase.label}</span>
          <span className={style.phaseTimer}>{secondsLeft}s</span>
        </div>
      </div>

      <div className={style.progressTrack}>
        <div className={style.progressFill} style={{ width: `${phasePercent}%` }} />
      </div>

      <div className={style.actions}>
        <button className={style.primaryButton} onClick={() => setIsRunning((current) => !current)}>
          {isRunning ? "Pause" : "Start exercise"}
        </button>
        <button className={style.secondaryButton} onClick={handleReset}>
          Reset
        </button>
      </div>
    </section>
  );
}
