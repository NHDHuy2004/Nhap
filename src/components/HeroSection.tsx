"use client";

import { motion } from "framer-motion";
import HeartAnimation from "./HeartAnimation";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, rgba(255,95,143,0.1) 0%, transparent 65%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
      />

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 1.2, ease: EASE }}
        className="font-serif text-xl italic text-love-100/75 sm:text-2xl"
      >
        Chào bạn, Băng Tâm.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 1.4, ease: EASE }}
        className="mt-10 sm:mt-12"
      >
        <HeartAnimation size={150} className="scale-90 sm:scale-100" />
      </motion.div>

      <div className="mt-12 flex flex-col items-center gap-2 sm:mt-14">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2, ease: EASE }}
          className="text-sm tracking-wide text-love-100/65 sm:text-base"
        >
          Món quà đầu tiên của tui...
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 1.2, ease: EASE }}
          className="text-sm tracking-wide text-love-100/65 sm:text-base"
        >
          ...hy vọng bạn thấy thích.
        </motion.p>
      </div>
    </section>
  );
}