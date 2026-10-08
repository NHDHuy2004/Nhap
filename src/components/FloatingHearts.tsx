"use client";

import { useEffect, useState } from "react";

const HEART = "M8,14 C6,12.4 2,9 2,5.6 C2,3.2 4,1.4 6.2,1.4 C7.4,1.4 7.9,2.2 8,3 C8.1,2.2 8.6,1.4 9.8,1.4 C12,1.4 14,3.2 14,5.6 C14,9 10,12.4 8,14 Z";

interface HeartSpec {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  sway: number;
  fill: string;
}

interface FloatingHeartsProps {
  count?: number;
}

export default function FloatingHearts({ count }: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<HeartSpec[]>([]);

  useEffect(() => {
    const total = count ?? (window.innerWidth < 640 ? 8 : 14);
    const fills = ["#ff5f8f", "#ff9ab8", "#e07ff1", "#ffd166"];
    // Random layout is only known on the client; the linter rule is bypassed
    // because this is a genuine one-time mount generation with no dependencies.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHearts(
      Array.from({ length: total }, (_, i) => ({
        id: i,
        size: 10 + Math.random() * 20,
        left: Math.random() * 100,
        duration: 16 + Math.random() * 16,
        delay: -Math.random() * 26,
        opacity: 0.16 + Math.random() * 0.3,
        sway: 3.2 + Math.random() * 3,
        fill: fills[i % fills.length],
      })),
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-riser absolute"
          style={{
            left: `${h.left}%`,
            top: 0,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: 0,
            ["--heart-fade" as string]: h.opacity,
          }}
        >
          <span
            className="heart-sway block"
            style={{
              animationDuration: `${h.sway}s`,
              opacity: h.opacity,
            }}
          >
            <svg
              width={h.size}
              height={h.size}
              viewBox="0 0 16 16"
              style={{ filter: "drop-shadow(0 0 6px rgba(255,95,143,0.8))" }}
            >
              <path d={HEART} fill={h.fill} />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
}