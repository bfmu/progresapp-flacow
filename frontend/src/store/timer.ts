import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimerState = {
  isVisible: boolean;
  defaultDurationMs: number;
  isRunning: boolean;
  endAt: number | null;
  remainingMs: number; // usado cuando está en pausa
  currentTotalMs: number; // total de la corrida actual (para %)
  displayMode: 'compact' | 'overlay';
  overlayHeight: 'half' | 'full';
  highContrast: boolean;
};

type TimerActions = {
  toggleVisible: () => void;
  setVisible: (visible: boolean) => void;
  setDefaultMinutes: (minutes: number) => void;
  start: (durationMs?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finalizeIfExpired: () => void;
  setDisplayMode: (mode: 'compact' | 'overlay') => void;
  toggleOverlayHeight: () => void;
  toggleHighContrast: () => void;
};

export const useTimerStore = create(
  persist<TimerState & TimerActions>(
    (set, get) => ({
      isVisible: true,
      defaultDurationMs: 3 * 60 * 1000,
      isRunning: false,
      endAt: null,
      remainingMs: 3 * 60 * 1000,
      currentTotalMs: 3 * 60 * 1000,
      displayMode: 'compact',
      overlayHeight: 'half',
      highContrast: false,

      toggleVisible: () => set((s) => ({ isVisible: !s.isVisible })),
      setVisible: (visible: boolean) => set({ isVisible: visible }),

      setDefaultMinutes: (minutes: number) =>
        set((s) => ({
          defaultDurationMs: Math.max(1000, Math.round(minutes * 60 * 1000)),
          // si no está corriendo, alineamos el restante al nuevo por defecto
          remainingMs: s.isRunning ? s.remainingMs : Math.max(1000, Math.round(minutes * 60 * 1000)),
          currentTotalMs: s.isRunning ? s.currentTotalMs : Math.max(1000, Math.round(minutes * 60 * 1000)),
        })),

      start: (durationMs?: number) =>
        set((s) => {
          const ms = Math.max(1000, Math.round(durationMs ?? s.defaultDurationMs));
          const now = Date.now();
          return {
            isRunning: true,
            endAt: now + ms,
            remainingMs: ms,
            currentTotalMs: ms,
          };
        }),

      pause: () =>
        set((s) => {
          if (!s.isRunning || s.endAt == null) return {} as any;
          const now = Date.now();
          const remaining = Math.max(0, s.endAt - now);
          return { isRunning: false, endAt: null, remainingMs: remaining };
        }),

      resume: () =>
        set((s) => {
          if (s.isRunning || s.remainingMs <= 0) return {} as any;
          const now = Date.now();
          return { isRunning: true, endAt: now + s.remainingMs };
        }),

      reset: () =>
        set((s) => ({
          isRunning: false,
          endAt: null,
          remainingMs: s.defaultDurationMs,
          currentTotalMs: s.defaultDurationMs,
        })),

      finalizeIfExpired: () =>
        set((s) => {
          if (!s.isRunning || s.endAt == null) return {} as any;
          const now = Date.now();
          if (now >= s.endAt) {
            return { isRunning: false, endAt: null, remainingMs: 0 };
          }
          return {} as any;
        }),

      setDisplayMode: (mode) => set({ displayMode: mode }),
      toggleOverlayHeight: () => set((s) => ({ overlayHeight: s.overlayHeight === 'half' ? 'full' : 'half' })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
    }),
    { name: "timer-store" }
  )
);


