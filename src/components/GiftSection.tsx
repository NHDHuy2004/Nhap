"use client";

import { motion } from "framer-motion";
import HeartAnimation from "./HeartAnimation";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function GiftSection() {
  return (
    <section className="relative flex min-h-[110svh] flex-col items-center justify-center px-6 py-32">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, ease: EASE }}
        className="max-w-md text-center font-serif text-2xl italic leading-relaxed text-love-100/85 sm:text-3xl"
      >
        Đây chỉ là món quà đầu tiên thôi.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{ delay: 0.9, duration: 1.2, ease: EASE }}
        className="mt-16 sm:mt-20"
      >
        <HeartAnimation size={72} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{ delay: 1.8, duration: 1.1, ease: EASE }}
        className="mt-16 max-w-md text-center font-serif text-xl italic leading-relaxed text-love-100/70 sm:mt-20 sm:text-2xl"
      >
        Tui nghĩ sau này sẽ còn nhiều cái hay ho hơn để tặng bạn.
      </motion.p>
    </section>
  );
}