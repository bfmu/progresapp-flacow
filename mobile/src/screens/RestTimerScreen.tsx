/**
 * RestTimerScreen — Phase 7 implementation
 *
 * Covers spec scenarios:
 *   - Start default timer (7.2)
 *   - Customize duration (7.2)
 *   - Timer completes in background — local push notification (7.3)
 *   - Cancel timer — cancels pending notification (7.3)
 *   - Extend timer — re-schedules notification (7.3)
 *   - First-time permission prompt — contextual on first start (7.4)
 *   - Permission denied — visual timer proceeds, no notification (7.4)
 *   - Timer completes in foreground — Alert.alert (7.5)
 *
 * Architecture:
 *   - Reads/writes `useTimerStore` from `@progresapp/shared`
 *   - `setInterval` drives `tick()` every second while running
 *   - `expo-notifications` schedules a local notification on timer start
 *     and cancels it on pause/reset/extend/unmount
 *   - Permission is requested contextually on first start only
 */
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import * as Notifications from "expo-notifications";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTimerStore } from "@progresapp/shared/store/timer";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "RestTimer">;

/** Default rest duration in milliseconds (90 seconds). */
const DEFAULT_DURATION_MS = 90 * 1000;

/** Formats milliseconds as MM:SS string. */
function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const RestTimerScreen = (_props: Props) => {
  const { isRunning, isComplete, remainingMs, defaultDurationMs, start, pause, reset, tick } =
    useTimerStore();

  // Custom duration the user has dialed in (in seconds, shown in the input)
  const [customSeconds, setCustomSeconds] = useState<string>(
    String(Math.round(defaultDurationMs / 1000))
  );

  // Ref to the setInterval handle — cleared on pause/reset/unmount
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notification identifier returned by expo-notifications — used to cancel
  const notificationIdRef = useRef<string | null>(null);

  // Whether we have already requested notification permission this session
  const permissionRequestedRef = useRef<boolean>(false);

  // Whether notifications are available (permission granted)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // --- Interval management ---

  const clearTickInterval = () => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTickInterval = () => {
    clearTickInterval();
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);
  };

  // Cleanup on unmount — stop interval and cancel any pending notification
  useEffect(() => {
    return () => {
      clearTickInterval();
      cancelScheduledNotification();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 7.5: Foreground completion alert ---
  useEffect(() => {
    if (isComplete) {
      clearTickInterval();
      // Cancel any still-pending notification (shouldn't normally have one at
      // this point since the scheduled time has elapsed, but clean up just in case)
      cancelScheduledNotification();
      Alert.alert("¡Listo!", "Tu descanso terminó.", [
        {
          text: "OK",
          onPress: () => reset(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // --- 7.3: Notification helpers ---

  const cancelScheduledNotification = async () => {
    if (notificationIdRef.current != null) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      } catch {
        // ignore — notification may have already fired
      }
      notificationIdRef.current = null;
    }
  };

  const scheduleNotification = async (durationMs: number) => {
    if (!notificationsEnabled) return;
    const seconds = Math.max(1, Math.round(durationMs / 1000));
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Descanso terminado",
          body: "Es hora de continuar con tu entrenamiento.",
          sound: true,
        },
        trigger: { seconds } as any,
      });
      notificationIdRef.current = id;
    } catch {
      // Notification scheduling failed (e.g. simulator limitation) — proceed
    }
  };

  // --- 7.4: Contextual permission request ---

  const requestPermissionIfNeeded = async (): Promise<boolean> => {
    if (permissionRequestedRef.current) {
      // Already asked this session — use cached result
      return notificationsEnabled;
    }
    permissionRequestedRef.current = true;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setNotificationsEnabled(granted);
      if (!granted) {
        // 7.4 Permission denied: inform the user but allow the visual timer to run
        Alert.alert(
          "Notificaciones desactivadas",
          "No podrás recibir alertas cuando el temporizador termine en segundo plano. Podés activarlas desde los ajustes del dispositivo.",
          [{ text: "Entendido" }]
        );
      }
      return granted;
    } catch {
      setNotificationsEnabled(false);
      return false;
    }
  };

  // --- Timer controls ---

  const handleStart = async (durationMs?: number) => {
    const ms = durationMs ?? parseCustomDurationMs() ?? defaultDurationMs;

    // Cancel any existing notification before scheduling a new one
    await cancelScheduledNotification();

    // 7.4: request permission contextually (first time only)
    const canNotify = await requestPermissionIfNeeded();

    start(ms);
    startTickInterval();

    // 7.3: schedule background notification
    if (canNotify) {
      await scheduleNotification(ms);
    }
  };

  const handlePause = async () => {
    pause();
    clearTickInterval();
    // 7.3: cancel pending notification on pause (per spec: Cancel timer scenario)
    await cancelScheduledNotification();
  };

  const handleReset = async () => {
    reset();
    clearTickInterval();
    // 7.3: cancel pending notification on reset
    await cancelScheduledNotification();
    // Restore the custom duration input to the store default
    setCustomSeconds(String(Math.round(defaultDurationMs / 1000)));
  };

  const handleExtend = async (extraMs: number) => {
    if (!isRunning) return;
    // 7.3 Extend timer: cancel current notification, start a new one from updated remaining
    await cancelScheduledNotification();
    const newDurationMs = remainingMs + extraMs;
    // Re-start with new duration (keeps the wall-clock correct)
    start(newDurationMs);
    startTickInterval();
    const canNotify = notificationsEnabled;
    if (canNotify) {
      await scheduleNotification(newDurationMs);
    }
  };

  /** Parse the custom seconds input. Returns null if invalid. */
  const parseCustomDurationMs = (): number | null => {
    const secs = parseInt(customSeconds, 10);
    if (isNaN(secs) || secs <= 0) return null;
    return secs * 1000;
  };

  const handleCustomStart = async () => {
    const ms = parseCustomDurationMs();
    if (ms == null) {
      Alert.alert("Duración inválida", "Ingresá un número de segundos mayor que cero.");
      return;
    }
    await handleStart(ms);
  };

  const isInputValid = parseCustomDurationMs() != null;

  return (
    <View
      testID="rest-timer-screen"
      className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-900"
    >
      {/* Countdown display */}
      <Text
        testID="timer-display"
        className="mb-8 text-7xl font-bold tabular-nums text-slate-900 dark:text-white"
      >
        {formatTime(isRunning || isComplete ? remainingMs : (parseCustomDurationMs() ?? defaultDurationMs))}
      </Text>

      {/* Permission denied notice */}
      {!notificationsEnabled && permissionRequestedRef.current && (
        <Text
          testID="notifications-disabled-notice"
          className="mb-4 text-center text-sm text-amber-600 dark:text-amber-400"
        >
          Las notificaciones de fondo están desactivadas. El temporizador visual sigue funcionando.
        </Text>
      )}

      {/* Duration input — only shown when timer is idle */}
      {!isRunning && !isComplete && (
        <View className="mb-6 w-full flex-row items-center gap-3">
          <TextInput
            testID="duration-input"
            className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
            value={customSeconds}
            onChangeText={setCustomSeconds}
            keyboardType="number-pad"
            placeholder="Segundos de descanso"
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
          />
          <Text className="text-sm text-slate-500 dark:text-slate-400">seg</Text>
        </View>
      )}

      {/* Control buttons */}
      <View className="w-full gap-3">
        {!isRunning ? (
          <Pressable
            testID="start-button"
            onPress={handleCustomStart}
            disabled={!isInputValid}
            className={`w-full items-center rounded-md py-3 ${
              isInputValid ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <Text className="text-base font-semibold text-white">Iniciar descanso</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              testID="pause-button"
              onPress={handlePause}
              className="w-full items-center rounded-md bg-amber-500 py-3"
            >
              <Text className="text-base font-semibold text-white">Pausar</Text>
            </Pressable>

            {/* 7.3 Extend timer: +30s button */}
            <Pressable
              testID="extend-button"
              onPress={() => handleExtend(30 * 1000)}
              className="w-full items-center rounded-md bg-blue-600 py-3"
            >
              <Text className="text-base font-semibold text-white">+30 segundos</Text>
            </Pressable>
          </>
        )}

        {/* Reset — always visible while running or after complete */}
        {(isRunning || isComplete) && (
          <Pressable
            testID="reset-button"
            onPress={handleReset}
            className="w-full items-center rounded-md bg-slate-500 py-3"
          >
            <Text className="text-base font-semibold text-white">Cancelar</Text>
          </Pressable>
        )}
      </View>

      {/* Preset quick-start buttons (covers "Customize duration" scenario) */}
      {!isRunning && !isComplete && (
        <View className="mt-8 w-full">
          <Text className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            Duraciones rápidas
          </Text>
          <View className="flex-row gap-2">
            {[30, 60, 90, 120, 180].map((secs) => (
              <Pressable
                key={secs}
                testID={`preset-${secs}s`}
                onPress={() => {
                  setCustomSeconds(String(secs));
                  handleStart(secs * 1000);
                }}
                className="flex-1 items-center rounded-md bg-slate-100 py-2 dark:bg-slate-800"
              >
                <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default RestTimerScreen;
