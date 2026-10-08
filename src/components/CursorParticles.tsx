"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParticles } from "@/hooks/useParticles";

const PHRASES = [
  "Bất ngờ chưa? ❤️",
  "Chăm chỉ mở nữa nha, còn nhiều á.",
  "Băng Tâm ✨",
];

interface Phrase {
  id: number;
  x: number;
  y: number;
  text: string;
}

function isInteractive(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest("button, a, [data-ui], [role='button']") !== null
  );
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  const { emit, ripple } = useParticles(canvasRef);
  const lastPos = useRef({ x: 0, y: 0, has: false });
  const lastPhraseAt = useRef(0);
  const [wwwPhrases, setPhrases] = useState<Phrase[]>([]);
  const phraseId = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const spawnPhrase = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastPhraseAt.current < 14000) return;
    if (Math.random() > 0.12) return;
    lastPhraseAt.current = now;
    const id = phraseId.current++;
    const text = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    setPhrases((list) => [...list.slice(-3), { id, x, y, text }]);
    window.setTimeout(() => {
      setPhrases((list) => list.filter((p) => p.id !== id));
    }, 2700);
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!finePointer) return;
      if (event.pointerType === "touch") return;
      const pos = lastPos.current;
      if (pos.has) {
        const dx = event.clientX - pos.x;
        const dy = event.clientY - pos.y;
        emit(event.clientX, event.clientY, {
          count: 2,
          speed: Math.min(6, Math.hypot(dx, dy) * 0.08),
          spread: 1.6,
          size: 3.2,
          life: 0.7,
          colors: ["#ff9ab8", "#cdb6ff", "#ffffff"],
        });
      }
      pos.x = event.clientX;
      pos.y = event.clientY;
      pos.has = true;
    };

    const onDown = (event: PointerEvent) => {
      if (isInteractive(event.target)) return;
      const { clientX, clientY } = event;
      ripple(clientX, clientY, event.pointerType === "touch" ? "#ff9ab8" : "#ffffff");
      emit(clientX, clientY, {
        kind: "heart",
        count: 8,
        speed: 2.4,
        spread: 2.4,
        size: 7,
        life: 1.4,
        colors: ["#ff5f8f", "#ff9ab8", "#ffd166"],
      });
      emit(clientX, clientY, {
        count: 14,
        speed: 4.6,
        spread: Math.PI * 2,
        size: 2.4,
        life: 0.9,
        colors: ["#ffe1ec", "#ffd6e2", "#e9e2ff"],
      });
      spawnPhrase(clientX, clientY);
    };

    const onLeave = () => {
      lastPos.current.has = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [emit, ripple, spawnPhrase, finePointer]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />
      {wwwPhrases.map((phrase) => (
        <span
          key={phrase.id}
          className="phrase-pop pointer-events-none fixed z-50 -translate-x-1/2 whitespace-nowrap font-serif text-lg italic text-love-200/90 sm:text-xl"
          style={{
            left: phrase.x,
            top: phrase.y,
            textShadow: "0 0 14px rgba(255,95,143,0.35)",
          }}
        >
          {phrase.text}
        </span>
      ))}
    </>
  );
}