import { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography, Slider, Paper, Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Pause, PlayArrow, PlayCircle, RestartAlt, Visibility, VisibilityOff, Timer, Fullscreen, FullscreenExit, Brightness4, Brightness7, SkipNext } from "@mui/icons-material";
import { useTimerStore } from "../../store/timer";

function formatMs(ms: number): string {
  const clamped = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(clamped / 60).toString().padStart(2, "0");
  const s = Math.floor(clamped % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function RestTimer() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isVisible = useTimerStore((s) => s.isVisible);
  const isRunning = useTimerStore((s) => s.isRunning);
  const endAt = useTimerStore((s) => s.endAt);
  const remainingMsStore = useTimerStore((s) => s.remainingMs);
  const defaultDurationMs = useTimerStore((s) => s.defaultDurationMs);
  const currentTotalMs = useTimerStore((s) => s.currentTotalMs);
  const toggleVisible = useTimerStore((s) => s.toggleVisible);
  const setDefaultMinutes = useTimerStore((s) => s.setDefaultMinutes);
  const setVisible = useTimerStore((s) => s.setVisible);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const finalizeIfExpired = useTimerStore((s) => s.finalizeIfExpired);
  const displayMode = useTimerStore((s) => s.displayMode);
  const setDisplayMode = useTimerStore((s) => s.setDisplayMode);
  const overlayHeight = useTimerStore((s) => s.overlayHeight);
  const toggleOverlayHeight = useTimerStore((s) => s.toggleOverlayHeight);
  const highContrast = useTimerStore((s) => s.highContrast);
  const toggleHighContrast = useTimerStore((s) => s.toggleHighContrast);

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
  const progress = useMemo(() => {
    if (currentTotalMs <= 0) return 0;
    return Math.round(((currentTotalMs - remainingMs) / currentTotalMs) * 100);
  }, [currentTotalMs, remainingMs]);

  const canResume = !isRunning && remainingMs > 0 && remainingMs < currentTotalMs;
  const canStartFresh = !isRunning && (remainingMs === 0 || remainingMs === currentTotalMs);
  const isPaused = canResume;

  // Colores por estado (barra y etiqueta):
  // - En conteo: azul
  // - Pausa: rojo
  // - Finalizado: verde
  // - Listo: azul suave
  const stateLabel = isRunning ? "En descanso" : remainingMs === 0 ? "Finalizado" : isPaused ? "En pausa" : "Listo";
  const stateColor = isRunning ? "#1e88e5" : remainingMs === 0 ? "#00e676" : isPaused ? "#ff1744" : "#29b6f6";

  if (!isVisible) {
    return (
      <Box sx={{ position: "fixed", right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))', display: "flex", justifyContent: "flex-end", zIndex: 1300 }}>
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

  const overlayBg = highContrast ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)');
  const overlayText = isDarkMode ? '#E6ECF5' : '#0d1b2a';
  const trackBg = isDarkMode ? (highContrast ? '#222' : 'rgba(255,255,255,0.12)') : (highContrast ? '#e0e0e0' : 'rgba(0,0,0,0.12)');
  const iconBg = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (displayMode === 'overlay') {
    return (
      <Box sx={{ position: "fixed", inset: 0, zIndex: 1400, bgcolor: overlayBg, display: "flex", flexDirection: "column" }}>
        {/* Barra superior de controles siempre visible (iconos) */}
        <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: overlayText }}>{stateLabel}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={highContrast ? "Contraste normal" : "Alto contraste"}>
              <IconButton color="inherit" onClick={toggleHighContrast} sx={{ color: overlayText }} aria-label="toggle-contrast">
                {highContrast ? <Brightness7 sx={{ fontSize: 28 }} /> : <Brightness4 sx={{ fontSize: 28 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title={overlayHeight === 'half' ? "Pantalla completa" : "Media pantalla"}>
              <IconButton color="inherit" onClick={toggleOverlayHeight} sx={{ color: overlayText }} aria-label="toggle-height">
                {overlayHeight === 'half' ? <Fullscreen sx={{ fontSize: 28 }} /> : <FullscreenExit sx={{ fontSize: 28 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Salir">
              <IconButton color="inherit" onClick={() => setDisplayMode('compact')} sx={{ color: overlayText }} aria-label="exit-overlay">
                <FullscreenExit sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        {/* Zona central del contador */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
          <Stack spacing={2} alignItems="center" sx={{ width: "100%", maxWidth: 1000 }}>
            <Typography sx={{
              fontSize: overlayHeight === 'half'
                ? { xs: highContrast ? '18vw' : '14vw', sm: highContrast ? '14vw' : '10vw' }
                : { xs: highContrast ? '30vw' : '24vw', sm: highContrast ? '22vw' : '16vw' },
              lineHeight: 1,
              fontWeight: 900,
              color: overlayText
            }}>
              {formatMs(remainingMs)}
            </Typography>
            <Box sx={{ width: "90%" }}>
              <Box sx={{ height: 14, borderRadius: 999, bgcolor: trackBg, overflow: "hidden" }}>
                <Box sx={{ width: `${progress}%`, height: "100%", bgcolor: stateColor, transition: "width 200ms linear" }} />
              </Box>
            </Box>
          </Stack>
        </Box>
        {/* Panel inferior con controles y configuración */}
        <Box sx={{ px: 2, pt: 2, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>
          <Stack spacing={1.5} alignItems="center" sx={{ width: "100%", maxWidth: 1000, mx: "auto" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {isRunning ? (
                <Tooltip title="Pausar">
                  <IconButton color="inherit" onClick={pause} sx={{ bgcolor: iconBg }}>
                    <Pause sx={{ fontSize: 32 }} />
                  </IconButton>
                </Tooltip>
              ) : canResume ? (
                <Tooltip title="Reanudar">
                  <IconButton color="primary" onClick={resume} sx={{ bgcolor: iconBg }}>
                    <PlayArrow sx={{ fontSize: 32 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Iniciar">
                  <IconButton color="primary" onClick={() => start()} sx={{ bgcolor: iconBg }}>
                    <PlayCircle sx={{ fontSize: 32 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Reiniciar">
                <IconButton color="inherit" onClick={reset} sx={{ bgcolor: iconBg }}>
                  <RestartAlt sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Nueva serie">
                <IconButton color="inherit" onClick={() => { reset(); start(); }} sx={{ bgcolor: iconBg }}>
                  <SkipNext sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box sx={{ width: "100%" }}>
              <Typography variant="caption" color="text.secondary">Duración por defecto: {minutesValue} min</Typography>
              <Slider aria-label="duracion" value={minutesValue} min={1} max={10} step={1} onChange={(_, v) => typeof v === "number" && setDefaultMinutes(v)} />
              <Stack direction="row" spacing={1}>
                {[1, 2, 3, 4, 5].map((m) => (
                  <Button key={m} size="small" variant={m === minutesValue ? "contained" : "outlined"} onClick={() => setDefaultMinutes(m)}>{m}m</Button>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", left: 0, right: 0, bottom: 'calc(24px + env(safe-area-inset-bottom))', display: "flex", justifyContent: "center", zIndex: 1300 }}>
      <Paper sx={{ px: 2, py: 1.5, borderRadius: 3, backdropFilter: "blur(8px)", bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}`, minWidth: 320 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Timer fontSize="small" />
            <Typography variant="subtitle2" sx={{ color: stateColor }}>{stateLabel}</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{formatMs(remainingMs)}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Pantalla completa / media">
              <IconButton size="small" onClick={() => setDisplayMode('overlay')} sx={{ bgcolor: iconBg }}>
                <Fullscreen />
              </IconButton>
            </Tooltip>
            {isRunning ? (
              <Tooltip title="Pausar">
                <IconButton onClick={pause} size="small" sx={{ bgcolor: iconBg }}>
                  <Pause />
                </IconButton>
              </Tooltip>
            ) : canResume ? (
              <Tooltip title="Reanudar">
                <IconButton color="primary" onClick={resume} size="small" sx={{ bgcolor: iconBg }}>
                  <PlayArrow />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Iniciar">
                <IconButton color="primary" onClick={() => start()} size="small" sx={{ bgcolor: iconBg }}>
                  <PlayCircle />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Reiniciar">
              <IconButton onClick={reset} size="small" sx={{ bgcolor: iconBg }}>
                <RestartAlt />
              </IconButton>
            </Tooltip>
            <Tooltip title={isVisible ? "Ocultar" : "Mostrar"}>
              <IconButton onClick={toggleVisible} size="small" sx={{ bgcolor: iconBg }}>
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


