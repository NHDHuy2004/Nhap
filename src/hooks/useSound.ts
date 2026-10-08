"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Đặt file nhạc vào `public/music/romantic.mp3` để website phát bản nhạc đó.
 * Nếu file chưa có, website tự động phát giai điệu tổng hợp làm phương án dự phòng.
 */
export const MUSIC_SRC = "/music/romantic.mp3";

const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 523.25], // C
  [196.0, 246.94, 293.66, 392.0], // G
  [220.0, 261.63, 329.63, 440.0], // Am
  [174.61, 220.0, 261.63, 349.23], // F
];
const CHORD_DURATION = 4;
const ARP_PATTERN = [0, 2, 1, 3, 2, 1];
const TARGET_VOLUME = 0.16;

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private delay: DelayNode | null = null;
  private timer: number | null = null;
  private nextChordAt = 0;
  private nextArpAt = 0;
  private base = 0;
  private chordIndex = 0;
  private arpIndex = 0;
  playing = false;

  private create() {
    const Ctor: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2600;
    master.connect(tone).connect(ctx.destination);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(master);

    this.ctx = ctx;
    this.master = master;
    this.delay = delay;
  }

  private pad(freq: number, at: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.055, at + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_DURATION + 1.4);
    gain.connect(master);

    for (const detune of [-4, 4]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(gain);
      osc.start(at);
      osc.stop(at + CHORD_DURATION + 1.6);
    }
  }

  private pluck(freq: number, at: number) {
    const ctx = this.ctx;
    const master = this.master;
    const delay = this.delay;
    if (!ctx || !master || !delay) return;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.07, at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.5);
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(master);
    gain.connect(delay);
    osc.start(at);
    osc.stop(at + 1.6);
  }

  private schedule = () => {
    const ctx = this.ctx;
    if (!ctx || !this.playing) return;
    const horizon = ctx.currentTime + 1.2;

    while (this.nextChordAt < horizon) {
      const chord = CHORDS[this.chordIndex % CHORDS.length];
      for (const freq of chord.slice(0, 3)) this.pad(freq, this.nextChordAt);
      this.chordIndex += 1;
      this.nextChordAt += CHORD_DURATION;
    }

    while (this.nextArpAt < horizon) {
      const chordIdx =
        (Math.floor((this.nextArpAt - this.base) / CHORD_DURATION) + CHORDS.length) %
        CHORDS.length;
      const note = CHORDS[chordIdx][ARP_PATTERN[this.arpIndex % ARP_PATTERN.length]] * 2;
      this.pluck(note, this.nextArpAt);
      this.arpIndex += 1;
      this.nextArpAt += 0.5;
    }
  };

  async start() {
    if (!this.ctx) this.create();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    if (ctx.state === "suspended") await ctx.resume();

    this.playing = true;
    this.chordIndex = 0;
    this.arpIndex = 0;
    this.nextChordAt = ctx.currentTime + 0.05;
    this.nextArpAt = ctx.currentTime + 0.4;
    this.base = ctx.currentTime + 0.05;

    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(TARGET_VOLUME, ctx.currentTime + 2);

    this.schedule();
    if (this.timer) window.clearInterval(this.timer);
    this.timer = window.setInterval(this.schedule, 500);
  }

  stop() {
    const ctx = this.ctx;
    const master = this.master;
    this.playing = false;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    window.setTimeout(() => {
      if (!this.playing && ctx.state === "running") void ctx.suspend();
    }, 1000);
  }

  dispose() {
    this.stop();
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.delay = null;
  }
}

export function useSound() {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [mode, setMode] = useState<"mp3" | "synth">("mp3");
  const modeRef = useRef(mode);
  const playingRef = useRef(false);
  const synthRef = useRef<AmbientSynth | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const setPlayingBoth = useCallback((value: boolean) => {
    playingRef.current = value;
    setPlaying(value);
  }, []);

  const startSynth = useCallback(async () => {
    if (!synthRef.current) synthRef.current = new AmbientSynth();
    const synth = synthRef.current;
    try {
      await synth.start();
      setBlocked(false);
      setPlayingBoth(true);
    } catch {
      setBlocked(true);
    }
  }, [setPlayingBoth]);

  const play = useCallback(async () => {
    if (MUSIC_SRC && modeRef.current === "mp3") {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio(MUSIC_SRC);
        audio.loop = true;
        audio.volume = 0;
        audioRef.current = audio;
      }
      try {
        await audio.play();
        audio.volume = 0;
        const start = performance.now();
        const fade = () => {
          const p = Math.min(1, (performance.now() - start) / 1300);
          if (audioRef.current === audio) audio.volume = p * 0.75;
          if (p < 1) requestAnimationFrame(fade);
        };
        fade();
        setBlocked(false);
        setPlayingBoth(true);
        return;
      } catch {
        audioRef.current = null;
        setMode("synth");
        await startSynth();
        return;
      }
    }
    await startSynth();
  }, [setPlayingBoth, startSynth]);

  const toggle = useCallback(async () => {
    if (playingRef.current) {
      if (modeRef.current === "mp3") audioRef.current?.pause();
      synthRef.current?.stop();
      setPlayingBoth(false);
      return;
    }
    await play();
  }, [play, setPlayingBoth]);

  return { playing, blocked, toggle };
}
