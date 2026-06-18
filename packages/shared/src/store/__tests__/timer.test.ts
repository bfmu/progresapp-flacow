import { useTimerStore } from "../timer";

const resetStore = () => {
  const { setDefaultMinutes, reset } = useTimerStore.getState();
  // Reset to a known default duration (3 minutes) and clear running state.
  setDefaultMinutes(3);
  reset();
};

describe("useTimerStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("start", () => {
    it("starts a countdown using the default duration when none is provided", () => {
      const before = Date.now();
      useTimerStore.getState().start();
      const state = useTimerStore.getState();

      expect(state.isRunning).toBe(true);
      expect(state.remainingMs).toBe(3 * 60 * 1000);
      expect(state.currentTotalMs).toBe(3 * 60 * 1000);
      expect(state.endAt).not.toBeNull();
      expect(state.endAt as number).toBeGreaterThanOrEqual(before + 3 * 60 * 1000);
    });

    it("starts a countdown using a custom duration when provided", () => {
      useTimerStore.getState().start(45 * 1000);
      const state = useTimerStore.getState();

      expect(state.isRunning).toBe(true);
      expect(state.remainingMs).toBe(45 * 1000);
      expect(state.currentTotalMs).toBe(45 * 1000);
    });
  });

  describe("pause", () => {
    it("stops the countdown and preserves the remaining time", () => {
      useTimerStore.getState().start(10 * 1000);
      useTimerStore.getState().pause();
      const state = useTimerStore.getState();

      expect(state.isRunning).toBe(false);
      expect(state.endAt).toBeNull();
      expect(state.remainingMs).toBeGreaterThan(0);
      expect(state.remainingMs).toBeLessThanOrEqual(10 * 1000);
    });

    it("does nothing when the timer is not running", () => {
      const before = useTimerStore.getState();
      useTimerStore.getState().pause();
      const after = useTimerStore.getState();

      expect(after.isRunning).toBe(before.isRunning);
      expect(after.endAt).toBe(before.endAt);
      expect(after.remainingMs).toBe(before.remainingMs);
    });
  });

  describe("reset", () => {
    it("restores the remaining and total time back to the default duration", () => {
      useTimerStore.getState().start(10 * 1000);
      useTimerStore.getState().reset();
      const state = useTimerStore.getState();

      expect(state.isRunning).toBe(false);
      expect(state.endAt).toBeNull();
      expect(state.remainingMs).toBe(3 * 60 * 1000);
      expect(state.currentTotalMs).toBe(3 * 60 * 1000);
    });

    it("keeps the timer stopped if it was already stopped", () => {
      useTimerStore.getState().reset();
      const state = useTimerStore.getState();

      expect(state.isRunning).toBe(false);
      expect(state.endAt).toBeNull();
    });

    it("clears isComplete when resetting a completed timer", () => {
      jest.useFakeTimers();
      useTimerStore.getState().start(1000);
      jest.advanceTimersByTime(1500);
      useTimerStore.getState().tick();
      expect(useTimerStore.getState().isComplete).toBe(true);

      useTimerStore.getState().reset();
      expect(useTimerStore.getState().isComplete).toBe(false);
      jest.useRealTimers();
    });
  });

  describe("tick", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("sets isComplete and stops running when countdown reaches zero", () => {
      useTimerStore.getState().start(3000); // 3 seconds
      // advance past the end
      jest.advanceTimersByTime(3500);
      useTimerStore.getState().tick();

      const state = useTimerStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.isRunning).toBe(false);
      expect(state.remainingMs).toBe(0);
    });

    it("does not set isComplete while time is still remaining", () => {
      useTimerStore.getState().start(5000); // 5 seconds
      jest.advanceTimersByTime(2000); // 2 seconds in — 3 remain
      useTimerStore.getState().tick();

      const state = useTimerStore.getState();
      expect(state.isComplete).toBe(false);
      expect(state.isRunning).toBe(true);
      expect(state.remainingMs).toBeGreaterThan(0);
    });

    it("does nothing when the timer is not running", () => {
      // timer is idle (not started)
      const before = useTimerStore.getState();
      useTimerStore.getState().tick();
      const after = useTimerStore.getState();

      expect(after.isComplete).toBe(false);
      expect(after.isRunning).toBe(before.isRunning);
    });

    it("does nothing when called on an already-complete timer (idempotent)", () => {
      useTimerStore.getState().start(1000);
      jest.advanceTimersByTime(1500);
      useTimerStore.getState().tick();
      expect(useTimerStore.getState().isComplete).toBe(true);

      // calling tick again on a completed (not running) timer should be a no-op
      useTimerStore.getState().tick();
      expect(useTimerStore.getState().isComplete).toBe(true);
      expect(useTimerStore.getState().isRunning).toBe(false);
    });

    it("sets isComplete at exactly zero remaining (boundary: 1ms past endAt)", () => {
      useTimerStore.getState().start(1000);
      jest.advanceTimersByTime(1001); // just past the boundary
      useTimerStore.getState().tick();

      expect(useTimerStore.getState().isComplete).toBe(true);
    });
  });
});
