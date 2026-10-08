"use client";

import { useEffect, useState } from "react";

interface TypewriterOptions {
  speed?: number;
  delay?: number;
  start?: boolean;
}

/** Reveals `text` one character at a time. */
export function useTypewriter(text: string, options: TypewriterOptions = {}) {
  const { speed = 65, delay = 0, start = true } = options;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;

    let index = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      setDisplayed("");
      setDone(false);
      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          interval = undefined;
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay, start]);

  return { displayed, done };
}
