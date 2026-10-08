"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  amp: number;
  speed: number;
  phase: number;
  warm: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
  alpha: number;
}

export default function StarBackground({
  boost = false,
  slow = false,
}: {
  boost?: boolean;
  slow?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef(boost);
  const slowRef = useRef(slow);

  useEffect(() => {
    boostRef.current = boost;
  }, [boost]);

  useEffect(() => {
    slowRef.current = slow;
  }, [slow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars: Star[] = [];
    let motes: Mote[] = [];
    const shooting: ShootingStar[] = [];
    let nextShootingAt = performance.now() + 1200;
    let raf = 0;
    let clock = 0;
    let last = performance.now();

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spawnStars = () => {
      const area = width * height;
      const density = reduced || coarse ? 1.35 : 1;
      const count = Math.min(240, Math.round(area / 5200 / density));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.35 + Math.random() * 1.15,
        base: 0.22 + Math.random() * 0.5,
        amp: 0.25 + Math.random() * 0.4,
        speed: 0.5 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.18,
      }));

      const moteCount = reduced ? 0 : Math.round(Math.min(40, area / 42000 / density));
      motes = Array.from({ length: moteCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.6,
        speed: 6 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.3,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnStars();
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const boostFactor = boostRef.current ? 1.7 : 1;
      const t = clock;

      for (const star of stars) {
        const twinkle = reduced ? 0.5 : Math.sin(t * star.speed + star.phase);
        const alpha = star.base + star.amp * twinkle;
        ctx.globalAlpha = Math.min(1, alpha * boostFactor);
        ctx.fillStyle = star.warm ? "#ffe1ec" : "#e9e2ff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * (boostFactor > 1.3 ? 1.25 : 1), 0, Math.PI * 2);
        ctx.fill();
      }

      for (const mote of motes) {
        const wave = Math.sin(t * 0.8 + mote.phase) * 14;
        ctx.globalAlpha = mote.alpha;
        ctx.fillStyle = "#cdb6ff";
        ctx.beginPath();
        ctx.arc(mote.x + wave, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = shooting.length - 1; i >= 0; i -= 1) {
        const s = shooting[i];
        s.age += 1;
        const p = s.age / s.life;
        s.x += s.vx;
        s.y += s.vy;
        if (s.age >= s.life) {
          shooting.splice(i, 1);
          continue;
        }
        const tail = 12;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
        grad.addColorStop(0, `rgba(255,255,255,${(1 - p) * 0.9})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.stroke();
      }

      if (!slowRef.current && !reduced && now > nextShootingAt && shooting.length < 2) {
        const startY = Math.random() * height * 0.4;
        const speed = 5 + Math.random() * 7;
        const angle = Math.PI * (0.62 + Math.random() * 0.2);
        shooting.push({
          x: width * (0.62 + Math.random() * 0.4),
          y: startY,
          vx: Math.cos(angle) * speed * -1,
          vy: Math.sin(angle) * speed,
          life: 34 + Math.random() * 20,
          age: 0,
        });
        nextShootingAt = now + 3500 + Math.random() * 6500;
      }

      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      clock += dt * (slowRef.current ? 0.26 : 1);
      draw(now);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        style={{
          background:
            "linear-gradient(180deg, #050014 0%, #0b0126 30%, #1a0533 58%, #2a0a3d 100%)",
        }}
        className="absolute inset-0"
      />
      <div
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(74,29,122,0.35) 0%, transparent 60%)",
        }}
        className="absolute inset-0"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="animate-cloud absolute -left-32 top-28 h-44 w-[28rem] rounded-full opacity-40 blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(94,52,140,0.5), transparent 70%)", animationDuration: "46s" }}
      />
      <div className="animate-cloud absolute -right-40 top-[55%] h-52 w-[34rem] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(ellipse, rgba(122,61,150,0.42), transparent 70%)", animationDuration: "58s" }}
      />
      <div className="animate-cloud absolute bottom-10 left-1/4 h-40 w-96 rounded-full opacity-25 blur-2xl"
        style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.35), transparent 70%)", animationDuration: "52s" }}
      />
    </div>
  );
}