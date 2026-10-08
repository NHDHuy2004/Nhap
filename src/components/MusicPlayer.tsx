"use client";

import { useSound } from "@/hooks/useSound";

export default function MusicPlayer() {
  const { playing, blocked, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      data-ui
      aria-pressed={playing}
      aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
      className="fixed bottom-5 right-5 z-[60] flex select-none items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs tracking-wide text-love-100/85 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-love-300/60 hover:bg-white/[0.06] hover:text-love-100"
    >
      {playing ? (
        <span className="flex h-3.5 items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="equalizer-bar w-[3px] rounded-full bg-love-400"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </span>
      ) : (
        <span aria-hidden>🎵</span>
      )}
      <span>{playing ? "Music" : "♫ Music"}</span>
      {blocked && <span className="text-[10px] text-love-400">(tap again)</span>}
    </button>
  );
}