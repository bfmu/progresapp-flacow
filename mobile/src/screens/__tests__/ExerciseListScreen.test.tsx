/**
 * Integration tests for ExerciseListScreen (mobile-workout-tracking spec scenarios):
 * - Renders a loading state then exercise list when API resolves
 * - Empty state when API returns empty array
 * - Renders muscle-group filter chips from getMusclesRequest response
 * - Filtering by muscle chip shows only matching exercises
 *
 * Uses @testing-library/react-native with the jest-expo preset.
 * Network calls are mocked; no real Axios calls.
 */

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ExerciseListScreen from "../ExerciseListScreen";

// ----- Mocks -----

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetAllExercises = jest.fn();
const mockGetAllMuscles = jest.fn();

jest.mock("@progresapp/shared/api/exercises", () => ({
  getAllExercises: (...args: unknown[]) => mockGetAllExercises(...args),
}));

jest.mock("@progresapp/shared/api/muscles", () => ({
  getAllMuscles: (...args: unknown[]) => mockGetAllMuscles(...args),
}));

// Navigation mock — ExerciseListScreen uses navigate("ExerciseDetail", { exerciseId })
const mockNavigate = jest.fn();
const navigationProp = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  addListener: jest.fn().mockReturnValue(() => {}),
  removeListener: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(false),
  getParent: jest.fn(),
  getState: jest.fn(),
  setParams: jest.fn(),
  getId: jest.fn(),
};

const routeProp = { key: "ExerciseList", name: "ExerciseList" as const, params: undefined };

// Sample data
const muscleChest = { id: 1, name: "Pecho" };
const muscleBack = { id: 2, name: "Espalda" };

const exerciseBenchPress = {
  id: 1,
  name: "Press de banca",
  description: "Ejercicio de pecho",
  muscle: muscleChest,
};
const exercisePulldown = {
  id: 2,
  name: "Jalón al pecho",
  description: "Ejercicio de espalda",
  muscle: muscleBack,
};

const renderScreen = () =>
  render(
    <ExerciseListScreen navigation={navigationProp as any} route={routeProp as any} />
  );

// ----- Tests -----

describe("ExerciseListScreen — loading state (Scenario: View exercise list)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows a loading indicator initially before data resolves", async () => {
    // Resolve after component is queried so we can see loading state
    let resolveExercises!: (v: unknown) => void;
    let resolveMuscles!: (v: unknown) => void;
    mockGetAllExercises.mockReturnValue(new Promise((r) => { resolveExercises = r; }));
    mockGetAllMuscles.mockReturnValue(new Promise((r) => { resolveMuscles = r; }));

    const { getByTestId, unmount } = renderScreen();

    expect(getByTestId("exercise-list-loading-indicator")).toBeTruthy();

    // Resolve to avoid act() warnings on unmount
    await act(async () => {
      resolveExercises({ data: [] });
      resolveMuscles({ data: [] });
    });

    unmount();
  });
});

describe("ExerciseListScreen — data display (Scenario: View exercise list)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders exercise list and muscle filter chips after API resolves", async () => {
    mockGetAllExercises.mockResolvedValueOnce({ data: [exerciseBenchPress, exercisePulldown] });
    mockGetAllMuscles.mockResolvedValueOnce({ data: [muscleChest, muscleBack] });

    const { getByTestId, getByText, unmount } = renderScreen();

    await waitFor(() => {
      expect(getByTestId("exercise-list")).toBeTruthy();
    });

    // Both exercises should be visible in the exercise list
    expect(getByText("Press de banca")).toBeTruthy();
    expect(getByText("Jalón al pecho")).toBeTruthy();

    // Muscle filter chips should be rendered (testID muscle-filter-{id})
    // Note: text inside FlatList renderItem may not be findable by getByText
    // in the jest-expo preset's FlatList mock — use getByTestId instead.
    expect(getByTestId("muscle-filter-1")).toBeTruthy();
    expect(getByTestId("muscle-filter-2")).toBeTruthy();

    unmount();
  });

  it("shows empty state message when API returns empty exercise array", async () => {
    mockGetAllExercises.mockResolvedValueOnce({ data: [] });
    mockGetAllMuscles.mockResolvedValueOnce({ data: [] });

    const { getByText, unmount } = renderScreen();

    await waitFor(() => {
      expect(getByText("No hay ejercicios para este músculo.")).toBeTruthy();
    });

    unmount();
  });
});

describe("ExerciseListScreen — muscle group filter (Scenario: Filter by muscle group)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows all exercises before any filter is selected", async () => {
    mockGetAllExercises.mockResolvedValueOnce({ data: [exerciseBenchPress, exercisePulldown] });
    mockGetAllMuscles.mockResolvedValueOnce({ data: [muscleChest, muscleBack] });

    const { getByText, unmount } = renderScreen();

    await waitFor(() => {
      expect(getByText("Press de banca")).toBeTruthy();
      expect(getByText("Jalón al pecho")).toBeTruthy();
    });

    unmount();
  });

  it("filters to matching exercises when a muscle chip is tapped", async () => {
    mockGetAllExercises.mockResolvedValueOnce({ data: [exerciseBenchPress, exercisePulldown] });
    mockGetAllMuscles.mockResolvedValueOnce({ data: [muscleChest, muscleBack] });

    const { getByTestId, getByText, queryByText, unmount } = renderScreen();

    await waitFor(() => {
      expect(getByTestId("exercise-list")).toBeTruthy();
    });

    // Tap the "Pecho" (chest) muscle filter chip
    await act(async () => {
      fireEvent.press(getByTestId("muscle-filter-1"));
    });

    // Only chest exercise should be visible
    expect(getByText("Press de banca")).toBeTruthy();
    // Back exercise should not be visible after filtering
    expect(queryByText("Jalón al pecho")).toBeNull();

    unmount();
  });
});
