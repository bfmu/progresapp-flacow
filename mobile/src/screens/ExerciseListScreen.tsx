import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getAllExercises } from "@progresapp/shared/api/exercises";
import { getAllMuscles } from "@progresapp/shared/api/muscles";
import type { Exercise, Muscle } from "@progresapp/shared/types/exercise";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseList">;

const GENERIC_ERROR_MESSAGE = "No se pudieron cargar los ejercicios. Intentalo más tarde.";

/**
 * Browse exercises (mobile-workout-tracking Scenario: View exercise list)
 * with an optional muscle-group filter (Scenario: Filter by muscle group).
 * Tapping an exercise navigates to `ExerciseDetail`.
 */
export const ExerciseListScreen = ({ navigation }: Props) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [selectedMuscleId, setSelectedMuscleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [exercisesResponse, musclesResponse] = await Promise.all([
        getAllExercises(),
        getAllMuscles(),
      ]);
      setExercises(exercisesResponse.data);
      setMuscles(musclesResponse.data);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredExercises =
    selectedMuscleId === null
      ? exercises
      : exercises.filter((exercise) => exercise.muscle?.id === selectedMuscleId);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator testID="exercise-list-loading-indicator" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-900">
        <Text className="text-center text-sm text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <View className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={muscles}
          keyExtractor={(muscle) => String(muscle.id)}
          ListHeaderComponent={
            <Pressable
              testID="muscle-filter-all"
              onPress={() => setSelectedMuscleId(null)}
              className={`mr-2 rounded-full px-4 py-2 ${
                selectedMuscleId === null ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedMuscleId === null ? "text-white" : "text-slate-900 dark:text-white"
                }`}
              >
                Todos
              </Text>
            </Pressable>
          }
          renderItem={({ item: muscle }) => (
            <Pressable
              testID={`muscle-filter-${muscle.id}`}
              onPress={() => setSelectedMuscleId(muscle.id)}
              className={`mr-2 rounded-full px-4 py-2 ${
                selectedMuscleId === muscle.id ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedMuscleId === muscle.id
                    ? "text-white"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {muscle.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        testID="exercise-list"
        data={filteredExercises}
        keyExtractor={(exercise) => String(exercise.id)}
        ListEmptyComponent={
          <View className="items-center px-6 py-10">
            <Text className="text-center text-sm text-slate-600 dark:text-slate-300">
              No hay ejercicios para este músculo.
            </Text>
          </View>
        }
        renderItem={({ item: exercise }) => (
          <Pressable
            testID={`exercise-item-${exercise.id}`}
            onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })}
            className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"
          >
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              {exercise.name}
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300">
              {exercise.muscle?.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default ExerciseListScreen;
