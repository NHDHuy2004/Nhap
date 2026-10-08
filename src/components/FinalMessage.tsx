"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FinalMessageProps {
  onBoost: (value: boolean) => void;
  onSlow: (value: boolean) => void;
  onCelebrate: (x: number, y: number) => void;
  onLaunch: (x: number, y: number) => void;
}

const SCHEDULE = [
  { at: 150, step: 1 },
  { at: 2000, step: 2 },
  { at: 2700, step: 3 },
  { at: 4700, step: 4 },
  { at: 7400, step: 5 },
  { at: 9900, step: 6 },
  { at: 12000, step: 7 },
  { at: 14200, step: 8 },
  { at: 17600, step: 9 },
];

export default function FinalMessage({ onBoost, onSlow, onCelebrate, onLaunch }: FinalMessageProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers = SCHEDULE.map(({ at, step: s }) =>
      window.setTimeout(() => setStep(s), at),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [inView]);

  useEffect(() => {
    if (inView) onSlow(true);
    return () => onSlow(false);
  }, [inView, onSlow]);

  useEffect(() => {
    if (step !== 3 || !inView) return;
    const x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const y = typeof window !== "undefined" ? window.innerHeight * 0.34 : 0;
    onCelebrate(x, y);
  }, [step, inView, onCelebrate]);

  useEffect(() => {
    if (step < 2) return;
    onBoost(true);
  }, [step, onBoost]);

  useEffect(() => {
    if (!inView) return;
    if (step === 6) {
      const t = window.setTimeout(
        () => onLaunch(window.innerWidth * 0.3, window.innerHeight * 0.35),
        600,
      );
      return () => window.clearTimeout(t);
    }
    if (step === 8) {
      const t = window.setTimeout(
        () => onLaunch(window.innerWidth * 0.68, window.innerHeight * 0.4),
        500,
      );
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [step, inView, onLaunch]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[130svh] flex-col items-center justify-center overflow-hidden px-6 py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(90% 70% at 50% 35%, rgba(42,10,61,0.65), #050014 85%)",
        }}
      />

      <div className="relative flex min-h-[70svh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <AnimatePresence>
          {step >= 1 && step < 9 && (
            <motion.div
              key="prose"
              className="flex w-full flex-col items-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)", transition: { duration: 0.7, ease: EASE } }}
            >
              <AnimatePresence>
                {step >= 1 && step < 4 && (
                  <motion.p
                    key="intro"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="font-serif text-xl italic text-love-100/85 sm:text-2xl"
                  >
                    Và đây là đoạn cuối của món quà...
                  </motion.p>
                )}
              </AnimatePresence>

              {step >= 4 && (
                <motion.h2
                  key="name"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: EASE }}
                  className="text-lift mt-14 font-serif text-4xl font-medium leading-snug text-love-100 sm:text-6xl"
                  style={{ letterSpacing: "0.02em" }}
                >
                  <span className="whitespace-nowrap">Nguyễn Trương</span>
                  <br className="sm:hidden" />
                  <span className="whitespace-nowrap">Băng Tâm</span>{" "}
                  <span aria-hidden className="font-sans text-love-300">
                    ❤️
                  </span>
                </motion.h2>
              )}

              {step >= 5 && (
                <motion.p
                  key="smile"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: EASE }}
                  className="mt-12 font-serif text-lg italic text-love-100/90 sm:text-xl"
                >
                  Mong bạn mỉm cười khi đọc đến đây.
                </motion.p>
              )}

              {step >= 6 && (
                <motion.p
                  key="unhappy"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="mt-6 font-serif text-base italic text-love-100/75 sm:text-lg"
                >
                  Nếu có hôm nào thấy hơi chán...
                </motion.p>
              )}

              {step >= 7 && (
                <motion.p
                  key="sky"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: EASE }}
                  className="mt-10 max-w-xl font-serif text-lg italic leading-relaxed text-love-100/85 sm:text-2xl"
                >
                  ...thì mở lại món quà này thêm lần nữa nhé.
                </motion.p>
              )}

              {step >= 8 && (
                <motion.p
                  key="heart-sky"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: EASE }}
                  className="text-lift mt-8 max-w-xl font-serif text-xl italic leading-relaxed text-love-100 sm:text-2xl"
                >
                  Để nhớ là luôn có người nghĩ về bạn nha. ❤️
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {step >= 9 && (
          <motion.div
            key="closing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <p aria-hidden className="text-sm tracking-[0.6em] text-love-300/60">
              ✦&ensp;·
            </p>

            <h2
              className="text-lift mt-12 font-serif text-3xl font-normal leading-snug text-love-100 sm:text-4xl"
              style={{ letterSpacing: "0.02em" }}
            >
              <span className="whitespace-nowrap">Nguyễn Trương</span>
              <br className="sm:hidden" />
              <span className="whitespace-nowrap">Băng Tâm</span>{" "}
              <span aria-hidden className="font-sans text-love-300">
                ❤️
              </span>
            </h2>

            <div
              aria-hidden
              className="mt-12 h-14 w-px bg-gradient-to-b from-transparent via-love-400/40 to-transparent"
            />

            <p className="mt-12 text-sm leading-relaxed text-love-100/55 sm:text-base">
              Tặng bạn ngần này thôi.
            </p>

            <p aria-hidden className="mt-12 text-sm tracking-[0.6em] text-love-300/60">
              ·&ensp;✦
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}