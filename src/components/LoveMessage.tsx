"use client";

import { motion } from "framer-motion";

const LINES = [
  "Băng Tâm ơi,",
  "tui không khéo nói, cũng chẳng có món gì to tát để tặng...",
  "nên tui gói mấy lời này lại thành một món quà nhỏ.",
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function LoveMessage() {
  return (
    <section className="relative flex min-h-[110svh] flex-col items-center justify-center overflow-hidden px-6 py-28">
      <div className="max-w-2xl text-center">
        {LINES.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 1, delay: i * 0.5, ease: EASE }}
            className="mb-5 font-serif text-xl italic leading-relaxed text-love-100/85 sm:text-2xl md:text-[1.7rem]"
          >
            {line}
          </motion.p>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, delay: 1.55, ease: EASE }}
          aria-hidden
          className="mx-auto my-10 flex max-w-sm items-center gap-3 text-love-400/60"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-love-500/40" />
          <span className="text-sm tracking-[0.4em]">· · ·</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-love-500/40" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.2, delay: 2.1, ease: EASE }}
          className="font-serif text-3xl font-medium leading-snug text-love-100 sm:text-4xl md:text-5xl"
        >
          Và hy vọng bạn sẽ thấy thích nó. ❤️
        </motion.p>
      </div>
    </section>
  );
}