"use client";

import { useEffect, useRef } from "react";
import {
  clearTextShapeCache,
  fireworksBus,
  getShapePoints,
  randomPalette,
  type FireworkRequest,
} from "@/lib/fireworks";

const STEP = 1 / 60;
const DRAG = 0.93;
const ARRIVE_FRAMES = 24;
const DRAG_INTEGRAL = (DRAG * (1 - Math.pow(DRAG, ARRIVE_FRAMES))) / (1 - DRAG);

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
  size: number;
  gravityDelay: number;
  gravity: number;
  alpha: number;
}

interface Rocket {
  t: number;
  dur: number;
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  request: FireworkRequest;
}

interface Flash {
  x: number;
  y: number;
  age: number;
  life: number;
  max: number;
  color: string;
}

const spriteCache = new Map<string, HTMLCanvasElement>();

function getSprite(color: string): HTMLCanvasElement {
  const cached = spriteCache.get(color);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.22, color);
    gradient.addColorStop(0.55, color + "66");
    gradient.addColorStop(1, color + "00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  spriteCache.set(color, canvas);
  return canvas;
}

function spawnSpark(
  list: Spark[],
  x: number,
  y: number,
  vx: number,
  vy: number,
  color: string,
  size: number,
  life: number,
  gravityDelay = 999,
  gravity = 0.35,
  alpha = 1,
) {
  list.push({ x, y, vx, vy, age: 0, life, color, size, gravityDelay, gravity, alpha });
}

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const flashes: Flash[] = [];
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const maxSparks = isCoarse ? 800 : 1700;
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

    document.fonts?.ready.then(() => clearTextShapeCache(), () => {});

    const launchRocket = (request: FireworkRequest) => {
      const startY = height + 24;
      const targetY = Math.max(60, request.y);
      const distance = startY - targetY;
      rockets.push({
        t: 0,
        dur: Math.min(1.5, Math.max(0.65, 0.5 + distance / height * 0.75)),
        p0x: request.x + (Math.random() - 0.5) * 60,
        p0y: startY,
        p1x: request.x + (Math.random() - 0.5) * 160,
        p1y: targetY + 150 + Math.random() * 130,
        p2x: request.x,
        p2y: targetY,
        request,
      });
    };

    const explode = (request: FireworkRequest) => {
      const size = request.size ?? (request.big ? 155 : 78);
      const colors = request.colors ?? randomPalette();
      const color = colors[0];
      const count = request.shape === "text" ? 460 : Math.min(420, Math.round(size * 2.6));
      const points = getShapePoints(request.shape, size, count, request.text);
      const hold = request.big ? 46 : 34;

      for (const point of points) {
        const sx = request.x + (Math.random() - 0.5) * 5;
        const sy = request.y + (Math.random() - 0.5) * 5;
        const dx = request.x + point.x - sx;
        const dy = request.y + point.y - sy;
        spawnSpark(
          sparks,
          sx,
          sy,
          dx / DRAG_INTEGRAL,
          dy / DRAG_INTEGRAL,
          colors[Math.floor(Math.random() * colors.length)],
          2.1 + Math.random() * 2.4,
          2.6 + Math.random() * 1.4,
          (ARRIVE_FRAMES + hold) / 60,
          0.34 + Math.random() * 0.22,
        );
      }

      // A softer cloud of sparks so the burst still feels like a firework.
      const cloud = Math.round(count * 0.45);
      for (let i = 0; i < cloud; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * (request.big ? 6.5 : 4.5);
        spawnSpark(
          sparks,
          request.x,
          request.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          colors[Math.floor(Math.random() * colors.length)],
          1.4 + Math.random() * 1.8,
          1.1 + Math.random() * 0.9,
        );
      }

      flashes.push({
        x: request.x,
        y: request.y,
        age: 0,
        life: 0.45,
        max: size * (request.big ? 3.4 : 2.6),
        color,
      });
    };

    const handle = (request: FireworkRequest) => {
      if (request.rocket) {
        launchRocket(request);
      } else {
        explode(request);
      }
    };

    const unsubscribe = fireworksBus.subscribe(handle);

    const bezier = (a: number, b: number, c: number, t: number) => {
      const mt = 1 - t;
      return mt * mt * a + 2 * mt * t * b + t * t * c;
    };

    const step = () => {
      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const rocket = rockets[i];
        rocket.t += STEP / rocket.dur;
        const t = Math.min(1, rocket.t);
        const x = bezier(rocket.p0x, rocket.p1x, rocket.p2x, t);
        const y = bezier(rocket.p0y, rocket.p1y, rocket.p2y, t);

        spawnSpark(
          sparks,
          x + (Math.random() - 0.5) * 4,
          y + Math.random() * 6,
          (Math.random() - 0.5) * 0.7,
          0.4 + Math.random() * 0.7,
          Math.random() > 0.5 ? "#ffd166" : "#ff9ab8",
          1.5 + Math.random() * 1.6,
          0.35 + Math.random() * 0.35,
        );
        spawnSpark(sparks, x, y, 0, -0.4, "#ffffff", 3.4, 0.12, 999, 0, 0.9);

        if (rocket.t >= 1) {
          explode(rocket.request);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.age += STEP;
        if (s.age >= s.life) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= DRAG;
        s.vy *= DRAG;
        if (s.age > s.gravityDelay) s.vy += s.gravity;
        s.x += s.vx;
        s.y += s.vy;
      }

      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        flashes[i].age += STEP;
        if (flashes[i].age >= flashes[i].life) flashes.splice(i, 1);
      }

      if (sparks.length > maxSparks) {
        sparks.splice(0, sparks.length - maxSparks);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const flash of flashes) {
        const p = flash.age / flash.life;
        const radius = flash.max * (0.35 + p * 0.75);
        ctx.globalAlpha = Math.max(0, (1 - p) * 0.5);
        const sprite = getSprite(flash.color);
        ctx.drawImage(sprite, flash.x - radius, flash.y - radius, radius * 2, radius * 2);
      }

      for (const s of sparks) {
        const p = s.age / s.life;
        const fadeIn = Math.min(1, s.age / 0.08);
        const alpha = s.alpha * fadeIn * (p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1);
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        const radius = s.size * 4.4 * (1 - p * 0.35);
        const sprite = getSprite(s.color);
        ctx.drawImage(sprite, s.x - radius, s.y - radius, radius * 2, radius * 2);
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
      while (acc >= STEP && guard < 6) {
        step();
        acc -= STEP;
        guard += 1;
      }
      if (guard >= 6) acc = 0;
      draw();
    };

    raf = requestAnimationFrame(frame);

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      sparks.length = 0;
      rockets.length = 0;
      flashes.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
