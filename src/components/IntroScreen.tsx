"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import HeartAnimation from "./HeartAnimation";
import { useParticles } from "@/hooks/useParticles";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const [stage, setStage] = useState(0);
  const [opening, setOpening] = useState(false);
  const opened = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useParticles(canvasRef, { max: 220 });

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 1400),
      window.setTimeout(() => setStage(2), 3400),
      window.setTimeout(() => setStage(3), 5600),
      window.setTimeout(() => setStage(4), 6700),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const open = () => {
    if (opened.current) return;
    opened.current = true;
    setOpening(true);
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    particles.emit(cx, cy, {
      count: 70,
      speed: 10,
      spread: Math.PI * 2,
      colors: ["#ffb3c9", "#ffd9e4", "#cdb6ff", "#ffffff"],
      size: 3.4,
      life: 1.3,
    });
    particles.emit(cx, cy, {
      kind: "heart",
      count: 7,
      speed: 4.5,
      spread: Math.PI * 2,
      colors: ["#ff5f8f", "#ff9ab8", "#ffd166"],
      size: 9,
      life: 1.7,
    });
    window.setTimeout(onEnter, 640);
  };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 30%, rgba(24,6,48,0.4) 0%, rgba(5,0,20,0.6) 75%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[31] h-full w-full"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <HeartAnimation size={100} onClick={open} className="scale-90 sm:scale-100" />
      </motion.div>

      <div className="mt-14 flex min-h-[150px] flex-col items-center gap-4 sm:mt-16 sm:gap-5">
        {stage >= 1 && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="max-w-md text-sm text-love-100/70 sm:text-base"
          >
            Tui làm món quà này muốn dành cho bạn...
          </motion.p>
        )}

        {stage >= 2 && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="max-w-md text-sm text-love-100/70 sm:text-base"
          >
            Mở từ từ thôi, đừng vội.
          </motion.p>
        )}

        {stage >= 3 && (
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, ease: EASE }}
            className="text-lift font-serif text-3xl font-normal leading-snug text-love-100 sm:text-5xl"
            style={{ letterSpacing: "0.02em" }}
          >
            <span className="whitespace-nowrap">Nguyễn Trương</span>
            <br className="sm:hidden" />
            <span className="whitespace-nowrap">Băng Tâm</span>{" "}
            <span aria-hidden className="font-sans text-love-300">
              ❤️
            </span>
          </motion.h1>
        )}
      </div>

      <div className="mt-10 h-16 sm:mt-12">
        {stage >= 4 && (
          <motion.button
            type="button"
            onClick={open}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="rounded-full border border-white/20 bg-transparent px-9 py-3 text-sm text-love-100/85 outline-none backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-love-300/60 hover:opacity-100 focus-visible:border-love-300/60"
          >
            Mở quà nhé ❤️
          </motion.button>
        )}
      </div>

      <p className="absolute bottom-8 px-6 text-[10px] tracking-[0.4em] text-love-300/45">
        MỘT MÓN QUÀ NHỎ
      </p>

      {opening && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[32]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,190,214,0.55) 0%, rgba(255,182,212,0.2) 42%, transparent 72%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}