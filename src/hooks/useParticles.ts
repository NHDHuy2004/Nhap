"use client";

import { useCallback, useEffect, useRef } from "react";

const STEP = 1 / 60;

export interface EmitOptions {
  count?: number;
  color?: string;
  colors?: string[];
  speed?: number;
  spread?: number;
  life?: number;
  size?: number;
  kind?: "dot" | "heart";
  direction?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
  size: number;
  rot: number;
  vr: number;
  kind: "dot" | "heart";
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  life: number;
  color: string;
}

const FALLBACK_COLORS = ["#ff9ab8", "#ffd166", "#ffffff", "#a855f7", "#ff5f8f"];

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.beginPath();
  for (let i = 0; i <= 36; i += 1) {
    const t = (i / 36) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const px = cx + x * scale;
    const py = cy - y * scale;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Lightweight canvas particle engine used for cursor trails, click hearts and
 * ripples. Returns an `emit` function that is safe to call from event handlers.
 */
export function useParticles(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: { max?: number; enabled?: boolean } = {},
) {
  const { max = 420, enabled = true } = options;
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const emit = useCallback(
    (x: number, y: number, opts: EmitOptions = {}) => {
      if (!enabledRef.current) return;
      const list = particlesRef.current;
      const count = opts.count ?? 1;
      const speed = opts.speed ?? 1.4;
      const spread = opts.spread ?? Math.PI * 2;
      const direction = opts.direction ?? -Math.PI / 2;
      const palette = opts.colors ?? FALLBACK_COLORS;
      const kind = opts.kind ?? "dot";

      for (let i = 0; i < count; i += 1) {
        const angle = direction + (Math.random() - 0.5) * spread;
        const velocity = speed * (0.45 + Math.random() * 0.9);
        list.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          age: 0,
          life: (opts.life ?? 0.9) * (0.7 + Math.random() * 0.6),
          color: opts.color ?? palette[Math.floor(Math.random() * palette.length)],
          size: (opts.size ?? 3) * (0.65 + Math.random() * 0.8),
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.12,
          kind,
        });
      }

      if (list.length > max) list.splice(0, list.length - max);
    },
    [max],
  );

  const ripple = useCallback((x: number, y: number, color = "#ff9ab8") => {
    if (!enabledRef.current) return;
    ripplesRef.current.push({ x, y, age: 0, life: 0.7, color });
    if (ripplesRef.current.length > 8) ripplesRef.current.shift();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const step = () => {
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const p = list[i];
        p.age += STEP;
        if (p.age >= p.life) {
          list.splice(i, 1);
          continue;
        }
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + (p.kind === "heart" ? -0.055 : 0.025);
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
      }
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        ripples[i].age += STEP;
        if (ripples[i].age >= ripples[i].life) ripples.splice(i, 1);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const r of ripplesRef.current) {
        const p = r.age / r.life;
        ctx.globalAlpha = (1 - p) * 0.7;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2 * (1 - p) + 0.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 12 + p * 68, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const p of particlesRef.current) {
        const progress = p.age / p.life;
        const alpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
        ctx.globalAlpha = Math.max(0, alpha);
        if (p.kind === "heart") {
          ctx.fillStyle = p.color;
          heartPath(ctx, p.x, p.y, p.size / 16);
          ctx.fill();
        } else {
          const radius = p.size * (1 - progress * 0.4);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      acc += dt;
      let guard = 0;
      while (acc >= STEP && guard < 5) {
        step();
        acc -= STEP;
        guard += 1;
      }
      if (guard >= 5) acc = 0;
      draw();
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      particlesRef.current = [];
      ripplesRef.current = [];
    };
  }, [canvasRef, enabled]);

  return { emit, ripple };
}
