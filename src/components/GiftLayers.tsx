"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const LINES = [
  "Có một điều tui muốn bạn biết...",
  "Bạn là một trong những người tui quý nhất.",
  "Nên tui muốn gói mấy lời này lại, làm quà tặng bạn.",
];

export default function GiftLayers({ onStars }: { onStars?: () => void }) {
  const fired = useRef(false);

  return (
    <section className="relative flex min-h-[110svh] flex-col items-center justify-center px-6 py-28">
      {LINES.map((line, i) => (
        <motion.p
          key={line}
          onViewportEnter={() => {
            if (i === 2 && !fired.current) {
              fired.current = true;
              onStars?.();
            }
          }}
          viewport={{ once: true, amount: 0.75 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: i * 0.4 }}
          className="mb-12 max-w-xl text-center font-serif text-2xl italic leading-relaxed text-love-100/85 sm:text-3xl"
        >
          {line}
        </motion.p>
      ))}
    </section>
  );
}