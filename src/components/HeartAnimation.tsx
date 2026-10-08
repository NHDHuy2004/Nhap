"use client";

import { useId, useMemo, useState, type CSSProperties, type PointerEvent } from "react";

const HEART_PATH =
  "M16,29 C12,25.5 3.5,18.5 3.5,11.5 C3.5,7 7,3.5 10.5,3.5 C13,3.5 15.3,5 16,7.5 " +
  "C16.7,5 19,3.5 21.5,3.5 C25,3.5 28.5,7 28.5,11.5 C28.5,18.5 20,25.5 16,29 Z";

interface SparkSpec {
  sx: string;
  sy: string;
  delay: number;
  size: number;
}

function buildSparks(): SparkSpec[] {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 26 + Math.random() * 34;
    return {
      sx: `${Math.cos(angle) * dist}px`,
      sy: `${Math.sin(angle) * dist}px`,
      delay: Math.random() * 60,
      size: 3 + Math.random() * 3,
    };
  });
}

interface HeartAnimationProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function HeartAnimation({ size = 96, className = "", onClick }: HeartAnimationProps) {
  const rawId = useId();
  const gradientId = `heart-fill-${rawId.replace(/:/g, "")}`;
  const glowId = `heart-glow-${rawId.replace(/:/g, "")}`;
  const [lit, setLit] = useState(false);
  const [burst, setBurst] = useState(0);

  const sparks = useMemo(() => (burst === 0 ? [] : buildSparks()), [burst]);

  const handlePointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setBurst((b) => b + 1);
    setLit(true);
    window.setTimeout(() => setLit(false), 320);
    onClick?.();
  };

  const filter = lit
    ? "drop-shadow(0 0 14px rgba(255,122,162,0.95)) drop-shadow(0 0 55px rgba(255,61,110,0.85))"
    : "drop-shadow(0 0 12px rgba(255,61,110,0.7)) drop-shadow(0 0 42px rgba(255,61,110,0.4))";

  const inline = { filter } as CSSProperties;

  return (
    <button
      type="button"
      aria-label="Trái tim"
      onClick={handlePointer}
      className={`group relative select-none touch-manipulation outline-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className="animate-heartbeat"
        style={inline}
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#ff5f8f" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ff2d5e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb0c9" />
            <stop offset="45%" stopColor="#ff5f8f" />
            <stop offset="100%" stopColor="#c61d4c" />
          </linearGradient>
        </defs>
        <path
          d={HEART_PATH}
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.5"
        />
        <ellipse cx="16" cy="16" rx="17" ry="17" fill={`url(#${glowId})`} className="animate-glow-breathe" />
      </svg>

      {burst > 0 && (
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
          {sparks.map((spark, i) => (
            <span
              key={`${burst}-${i}`}
              className="spark absolute h-1.5 w-1.5 rounded-full"
              style={
                {
                  "--sx": spark.sx,
                  "--sy": spark.sy,
                  animationDelay: `${spark.delay}ms`,
                  width: spark.size,
                  height: spark.size,
                  background: i % 3 === 0 ? "#ffd166" : "#ff9ab8",
                  boxShadow: "0 0 8px rgba(255,255,255,0.9)",
                } as CSSProperties
              }
            />
          ))}
        </span>
      )}
    </button>
  );
}