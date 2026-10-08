"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import IntroScreen from "./IntroScreen";
import StarBackground from "./StarBackground";
import FloatingHearts from "./FloatingHearts";
import FireworksCanvas from "./FireworksCanvas";
import CursorParticles from "./CursorParticles";
import MusicPlayer from "./MusicPlayer";
import HeroSection from "./HeroSection";
import GiftLayers from "./GiftLayers";
import LoveMessage from "./LoveMessage";
import GiftSection from "./GiftSection";
import FinalMessage from "./FinalMessage";
import { useFireworks } from "@/hooks/useFireworks";

function AutoCaption() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center"
    >
      <p className="text-lift font-serif text-4xl font-medium text-love-100 sm:text-6xl">
        Băng Tâm ❤️
      </p>
    </motion.div>
  );
}

export default function Experience() {
  const [phase, setPhase] = useState<"intro" | "main">("intro");
  const [boost, setBoost] = useState(false);
  const [slow, setSlow] = useState(false);
  const [autoText, setAutoText] = useState(false);
  const { launch, celebrate } = useFireworks();
  const hasEntered = useRef(false);

  useEffect(() => {
    document.body.style.overflow = phase === "intro" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "main") return;
    const timer = window.setTimeout(() => {
      const x = window.innerWidth / 2;
      const y = window.innerHeight * 0.36;
      celebrate(x, y);
      setAutoText(true);
      window.setTimeout(() => setAutoText(false), 4200);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [phase, celebrate]);

  useEffect(() => {
    if (phase !== "main") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const interval = window.setInterval(() => {
      launch(Math.random() * window.innerWidth, window.innerHeight * (0.16 + Math.random() * 0.3));
    }, 17000);
    return () => window.clearInterval(interval);
  }, [phase, launch]);

  useEffect(() => {
    if (phase !== "main") return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && target.closest && target.closest("button, a, [data-ui], [role='button']")) {
        return;
      }
      launch(event.clientX, event.clientY);
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [phase, launch]);

  const enterMain = () => {
    if (hasEntered.current) return;
    hasEntered.current = true;
    setPhase("main");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        <StarBackground boost={boost} slow={slow} />
        <FloatingHearts />

        <AnimatePresence>
          {phase === "intro" && <IntroScreen key="intro" onEnter={enterMain} />}
        </AnimatePresence>

        {phase === "main" && (
          <main className="relative z-10">
            <HeroSection />
            <GiftLayers onStars={() => setBoost(true)} />
            <LoveMessage />
            <GiftSection />
            <FinalMessage
              onBoost={setBoost}
              onSlow={setSlow}
              onCelebrate={celebrate}
              onLaunch={launch}
            />
          </main>
        )}

        <FireworksCanvas />
        {phase === "main" && <CursorParticles />}
        <MusicPlayer />

        <AnimatePresence>{autoText && <AutoCaption key="auto" />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}