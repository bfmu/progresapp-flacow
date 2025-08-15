import { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography, Slider, Paper, Button, Stack } from "@mui/material";
import { Pause, PlayArrow, RestartAlt, Visibility, VisibilityOff, Timer } from "@mui/icons-material";
import { useTimerStore } from "../../store/timer";

function formatMs(ms: number): string {
  const clamped = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(clamped / 60).toString().padStart(2, "0");
  const s = Math.floor(clamped % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function RestTimer() {
  const isVisible = useTimerStore((s) => s.isVisible);
  const isRunning = useTimerStore((s) => s.isRunning);
  const endAt = useTimerStore((s) => s.endAt);
  const remainingMsStore = useTimerStore((s) => s.remainingMs);
  const defaultDurationMs = useTimerStore((s) => s.defaultDurationMs);
  const toggleVisible = useTimerStore((s) => s.toggleVisible);
  const setDefaultMinutes = useTimerStore((s) => s.setDefaultMinutes);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const finalizeIfExpired = useTimerStore((s) => s.finalizeIfExpired);

  const intervalRef = useRef<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const prevRunningRef = useRef<boolean>(isRunning);
  const prevRemainingRef = useRef<number>(remainingMsStore);

  useEffect(() => {
    // tick del timer
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setNowMs(Date.now());
      finalizeIfExpired();
    }, 250);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [finalizeIfExpired]);

  const remainingMs = useMemo(() => {
    if (isRunning && endAt) {
      return Math.max(0, endAt - nowMs);
    }
    return remainingMsStore;
  }, [isRunning, endAt, remainingMsStore, nowMs]);

  // Aviso al finalizar: beep + vibración
  useEffect(() => {
    const prevRunning = prevRunningRef.current;
    const prevRemaining = prevRemainingRef.current;
    prevRunningRef.current = isRunning;
    prevRemainingRef.current = remainingMs;

    const justFinished = prevRunning && !isRunning && remainingMs === 0;
    const reachedZero = !isRunning && remainingMs === 0 && prevRemaining > 0;
    if (justFinished || reachedZero) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = 880;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          o.start();
          o.stop(ctx.currentTime + 0.32);
          // auto close
          setTimeout(() => ctx.close(), 400);
        }
        if (navigator.vibrate) navigator.vibrate(300);
      } catch {}
    }
  }, [isRunning, remainingMs]);

  const minutesValue = Math.round(defaultDurationMs / 60000);

  if (!isVisible) {
    return (
      <Box sx={{ position: "fixed", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 1300 }}>
        <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 999, border: (t) => `1px solid ${t.palette.divider}`, bgcolor: "background.paper" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">Timer oculto</Typography>
            <Tooltip title="Mostrar">
              <IconButton size="small" onClick={toggleVisible}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 1300 }}>
      <Paper sx={{ px: 2, py: 1.5, borderRadius: 3, backdropFilter: "blur(8px)", bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}`, minWidth: 320 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Timer fontSize="small" />
            <Typography variant="subtitle2">Descanso</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{formatMs(remainingMs)}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {!isRunning ? (
              <Tooltip title="Iniciar">
                <IconButton color="primary" onClick={() => start()} size="small">
                  <PlayArrow />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Pausar">
                <IconButton onClick={pause} size="small">
                  <Pause />
                </IconButton>
              </Tooltip>
            )}
            {!isRunning && remainingMs > 0 && (
              <Tooltip title="Reanudar">
                <IconButton onClick={resume} size="small">
                  <PlayArrow />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Reiniciar">
              <IconButton onClick={reset} size="small">
                <RestartAlt />
              </IconButton>
            </Tooltip>
            <Tooltip title={isVisible ? "Ocultar" : "Mostrar"}>
              <IconButton onClick={toggleVisible} size="small">
                {isVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Configuración */}
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Duración por defecto: {minutesValue} min</Typography>
          <Slider
            aria-label="duracion"
            size="small"
            value={minutesValue}
            min={1}
            max={10}
            step={1}
            onChange={(_, v) => typeof v === "number" && setDefaultMinutes(v)}
          />
          <Stack direction="row" spacing={1}>
            {[1, 2, 3, 4, 5].map((m) => (
              <Button key={m} size="small" variant={m === minutesValue ? "contained" : "outlined"} onClick={() => setDefaultMinutes(m)}>
                {m}m
              </Button>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}


