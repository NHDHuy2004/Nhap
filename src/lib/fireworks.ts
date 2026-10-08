export type ShapeKind = "heart" | "doubleHeart" | "sparkle" | "star" | "text";

export interface FireworkRequest {
  /** Anchor point (viewport pixels). */
  x: number;
  y: number;
  shape: ShapeKind;
  /** Radius of the shape in pixels. */
  size?: number;
  colors?: string[];
  text?: string;
  /** Rocket rises from the bottom instead of exploding immediately. */
  rocket?: boolean;
  /** Bigger explosion + brighter flash. */
  big?: boolean;
}

type Listener = (request: FireworkRequest) => void;

class FireworksBus {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(request: FireworkRequest) {
    this.listeners.forEach((listener) => listener(request));
  }
}

export const fireworksBus = new FireworksBus();

export const PALETTES: string[][] = [
  ["#ff5f8f", "#ff9ab8", "#ffd6e2"],
  ["#ff3d6e", "#ff7aa2", "#ffd166"],
  ["#a855f7", "#ff9ab8", "#ffffff"],
  ["#ffd166", "#fff3b0", "#ff9ab8"],
  ["#7dd3fc", "#a855f7", "#ff9ab8"],
];

export const CLICK_SHAPES: ShapeKind[] = [
  "heart",
  "doubleHeart",
  "sparkle",
  "star",
  "heart",
  "text",
];

let clickIndex = 0;

export function nextClickShape(): ShapeKind {
  const shape = CLICK_SHAPES[clickIndex % CLICK_SHAPES.length];
  clickIndex += 1;
  return shape;
}

export function randomPalette() {
  return PALETTES[Math.floor(Math.random() * PALETTES.length)];
}

export interface Point {
  x: number;
  y: number;
}

function heartOutline(count: number, scale: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const jitter = 0.88 + Math.random() * 0.16;
    points.push({ x: x * scale * jitter, y: -y * scale * jitter });
  }
  return points;
}

function normalize(points: Point[], radius: number): Point[] {
  let maxX = 0;
  let maxY = 0;
  for (const p of points) {
    maxX = Math.max(maxX, Math.abs(p.x));
    maxY = Math.max(maxY, Math.abs(p.y));
  }
  const factor = radius / Math.max(maxX, maxY, 1);
  return points.map((p) => ({ x: p.x * factor, y: p.y * factor }));
}

function polygonStar(points: number, outer: number, inner: number, ratio: number): Point[] {
  const out: Point[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  // Interpolate along the outline so the shape reads as a line of sparks.
  const dense: Point[] = [];
  const perEdge = 7;
  for (let i = 0; i < out.length; i += 1) {
    const a = out[i];
    const b = out[(i + 1) % out.length];
    for (let k = 0; k < perEdge; k += 1) {
      const t = k / perEdge;
      const jitter = (Math.random() - 0.5) * ratio;
      dense.push({
        x: a.x + (b.x - a.x) * t + jitter,
        y: a.y + (b.y - a.y) * t + jitter,
      });
    }
  }
  return dense;
}

function sparkleShape(count: number, radius: number): Point[] {
  const out: Point[] = [];
  const spikes = 4;
  const step = Math.PI / spikes;
  const outline: Point[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const r = i % 2 === 0 ? 1 : 0.24;
    const a = i * step - Math.PI / 2;
    outline.push({ x: Math.cos(a) * r * radius, y: Math.sin(a) * r * radius });
  }
  const perEdge = Math.max(4, Math.floor(count / outline.length));
  for (let i = 0; i < outline.length; i += 1) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    for (let k = 0; k < perEdge; k += 1) {
      const t = k / perEdge;
      out.push({
        x: a.x + (b.x - a.x) * t + (Math.random() - 0.5) * 3,
        y: a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 3,
      });
    }
  }
  // A few glints in the middle.
  for (let i = 0; i < count * 0.12; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.3;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return out;
}

const textCanvasCache = new Map<string, Point[]>();

function textShape(text: string, radius: number): Point[] {
  const cacheKey = `${text}:${Math.round(radius)}`;
  const cached = textCanvasCache.get(cacheKey);
  if (cached) {
    return cached.map((p) => ({ x: p.x, y: p.y }));
  }

  const canvas = document.createElement("canvas");
  const size = Math.round(radius * 2);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  let fontSize = Math.max(18, radius * 0.62);
  const family = '"Be Vietnam Pro", "Playfair Display", sans-serif';
  ctx.font = `700 ${fontSize}px ${family}`;
  const measured = ctx.measureText(text).width;
  if (measured > size * 0.9) {
    fontSize *= (size * 0.9) / measured;
    ctx.font = `700 ${fontSize}px ${family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, size / 2, size / 2);

  const data = ctx.getImageData(0, 0, size, size).data;
  const gap = Math.max(3, Math.round(fontSize / 14));
  const found: Point[] = [];
  for (let y = 0; y < size; y += gap) {
    for (let x = 0; x < size; x += gap) {
      if (data[(y * size + x) * 4 + 3] > 128) {
        found.push({ x: x - size / 2, y: y - size / 2 });
      }
    }
  }
  // Shuffle so particles do not fill in scanline order.
  for (let i = found.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [found[i], found[j]] = [found[j], found[i]];
  }
  const picked = found.slice(0, 460);
  textCanvasCache.set(cacheKey, picked);
  return picked.map((p) => ({ x: p.x, y: p.y }));
}

/** Call after web fonts are ready so text shapes use the real typeface. */
export function clearTextShapeCache() {
  textCanvasCache.clear();
}

/** Points centred on (0,0), roughly within `radius` pixels. */
export function getShapePoints(shape: ShapeKind, radius: number, count: number, text?: string): Point[] {
  switch (shape) {
    case "heart": {
      const pts = heartOutline(count, 1);
      const filled = pts.concat(
        Array.from({ length: Math.floor(count * 0.25) }, () => {
          const t = Math.random() * Math.PI * 2;
          const s = 0.45 + Math.random() * 0.45;
          const x = 16 * Math.pow(Math.sin(t), 3) * s;
          const y =
            (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s;
          return { x, y: -y };
        }),
      );
      return normalize(filled, radius);
    }
    case "doubleHeart": {
      const left = heartOutline(Math.floor(count * 0.5), 1).map((p) => ({
        x: p.x - 11,
        y: p.y,
      }));
      const right = heartOutline(Math.floor(count * 0.5), 1).map((p) => ({
        x: p.x + 11,
        y: p.y,
      }));
      return normalize(left.concat(right), radius);
    }
    case "star":
      return normalize(polygonStar(5, 10, 4.4, 3), radius);
    case "sparkle":
      return sparkleShape(count, radius);
    case "text":
      return textShape(text ?? "Tâm", radius);
    default:
      return normalize(heartOutline(count, 1), radius);
  }
}
