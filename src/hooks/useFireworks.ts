"use client";

import { useCallback } from "react";
import {
  CLICK_SHAPES,
  fireworksBus,
  randomPalette,
  type FireworkRequest,
  type ShapeKind,
} from "@/lib/fireworks";

export type LaunchOptions = Partial<Omit<FireworkRequest, "x" | "y">>;

let clickCounter = 0;

/**
 * Thin wrapper around the fireworks event bus so components never talk to the
 * canvas directly.
 */
export function useFireworks() {
  const launch = useCallback((x: number, y: number, options?: LaunchOptions) => {
    const shape: ShapeKind = options?.shape ?? CLICK_SHAPES[clickCounter++ % CLICK_SHAPES.length];
    fireworksBus.emit({
      shape,
      colors: randomPalette(),
      rocket: true,
      ...options,
      x,
      y,
    });
  }, []);

  const burst = useCallback((x: number, y: number, options?: LaunchOptions) => {
    fireworksBus.emit({
      shape: "heart",
      colors: randomPalette(),
      big: false,
      ...options,
      x,
      y,
    });
  }, []);

  /** Big celebratory rocket that blooms into a heart. */
  const celebrate = useCallback((x: number, y: number, options?: LaunchOptions) => {
    fireworksBus.emit({
      shape: "heart",
      colors: randomPalette(),
      rocket: true,
      big: true,
      size: 175,
      ...options,
      x,
      y,
    });
  }, []);

  return { launch, burst, celebrate };
}
