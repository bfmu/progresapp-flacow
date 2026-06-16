import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getExercise } from "@progresapp/shared/api/exercises";
import {
  createLiftingHistorie,
  deleteLiftingHistorie,
  getAllLiftingHistoriesForExercise,
  updateLiftingHistorie,
} from "@progresapp/shared/api/lifting-histories";
import type { Exercise, LiftingHistory } from "@progresapp/shared/types/exercise";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { validateLogSetForm, type LogSetFormErrors } from "./validation";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseDetail">;

const GENERIC_ERROR_MESSAGE = "Ocurrió un error. Por favor, inténtalo de nuevo.";
const LOAD_ERROR_MESSAGE = "No se pudo cargar el ejercicio. Intentalo más tarde.";

/** Sorts lifting-history entries newest-first by date, then by id. */
const sortByDateDesc = (entries: LiftingHistory[]): LiftingHistory[] =>
  [...entries].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  });

type SetFormProps = {
  testIDPrefix: string;
  initialWeight?: string;
  initialReps?: string;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: { weight: string; reps: string }) => Promise<void>;
  onCancel?: () => void;
};

/**
 * Shared weight/reps form used both for logging a new set (6.4) and for
 * editing an existing entry (6.5). Validation is delegated to
 * `validateLogSetForm` (RED/GREEN in `__tests__/validation.test.ts`).
 */
const SetForm = ({
  testIDPrefix,
  initialWeight = "",
  initialReps = "",
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: SetFormProps) => {
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState(initialReps);
  const [errors, setErrors] = useState<LogSetFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const validationErrors = validateLogSetForm({ weight, reps });
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({ weight, reps });
    } catch {
      setSubmitError(GENERIC_ERROR_MESSAGE);
    }
  };

  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Peso (kg)
      </Text>
      <TextInput
        testID={`${testIDPrefix}-weight-input`}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="60"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.weight ? (
        <Text className="mb-2 text-sm text-red-600">{errors.weight}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Repeticiones
      </Text>
      <TextInput
        testID={`${testIDPrefix}-reps-input`}
        value={reps}
        onChangeText={setReps}
        keyboardType="number-pad"
        placeholder="10"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.reps ? (
        <Text className="mb-2 text-sm text-red-600">{errors.reps}</Text>
      ) : (
        <View className="mb-2" />
      )}

      {submitError ? (
        <Text className="mb-2 text-center text-sm text-red-600">{submitError}</Text>
      ) : null}

      <View className="flex-row gap-2">
        <Pressable
          testID={`${testIDPrefix}-submit-button`}
          onPress={handleSubmit}
          disabled={submitting}
          className="flex-1 items-center rounded-md bg-blue-600 py-3 disabled:opacity-60"
        >
          <Text className="text-base font-semibold text-white">
            {submitting ? "Guardando..." : submitLabel}
          </Text>
        </Pressable>
        {onCancel ? (
          <Pressable
            testID={`${testIDPrefix}-cancel-button`}
            onPress={onCancel}
            disabled={submitting}
            className="flex-1 items-center rounded-md bg-slate-200 py-3 dark:bg-slate-700"
          >
            <Text className="text-base font-semibold text-slate-900 dark:text-white">
              Cancelar
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

type HistoryListItemProps = {
  entry: LiftingHistory;
  onUpdate: (id: number, values: { weight: string; reps: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

/**
 * Renders a single history entry with edit (6.5, inline `SetForm`) and
 * delete (6.5, confirm via `Alert.alert`) actions.
 */
const HistoryListItem = ({ entry, onUpdate, onDelete }: HistoryListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (values: { weight: string; reps: string }) => {
    setIsSaving(true);
    try {
      await onUpdate(entry.id, values);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Eliminar registro",
      "¿Seguro que querés eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
      ]
    );
  };

  if (isEditing) {
    return (
      <View
        testID={`history-item-${entry.id}-editing`}
        className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"
      >
        <SetForm
          testIDPrefix={`history-item-${entry.id}-edit`}
          initialWeight={String(entry.weight)}
          initialReps={String(entry.repeatNumber)}
          submitLabel="Guardar"
          submitting={isSaving}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </View>
    );
  }

  return (
    <View
      testID={`history-item-${entry.id}`}
      className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"
    >
      <View>
        <Text className="text-base font-semibold text-slate-900 dark:text-white">
          {entry.weight} kg x {entry.repeatNumber}
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-300">
          {new Date(entry.date).toLocaleDateString()}
        </Text>
      </View>
      <View className="flex-row gap-3">
        <Pressable testID={`history-item-${entry.id}-edit-button`} onPress={() => setIsEditing(true)}>
          <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">Editar</Text>
        </Pressable>
        <Pressable testID={`history-item-${entry.id}-delete-button`} onPress={handleDeletePress}>
          <Text className="text-sm font-medium text-red-600">Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Exercise detail: name/muscle (6.2), lifting-history list in
 * reverse-chronological order with empty state (6.2), a "log a set" form
 * (6.3/6.4), and per-entry edit/delete actions (6.5).
 */
export const ExerciseDetailScreen = ({ route }: Props) => {
  const { exerciseId } = route.params;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<LiftingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingNewSet, setIsSubmittingNewSet] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [exerciseResponse, historyResponse] = await Promise.all([
        getExercise(exerciseId),
        getAllLiftingHistoriesForExercise(exerciseId),
      ]);
      setExercise(exerciseResponse.data);
      setHistory(sortByDateDesc(historyResponse.data));
    } catch {
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (values: { weight: string; reps: string }) => {
    setIsSubmittingNewSet(true);
    try {
      await createLiftingHistorie({
        weight: Number(values.weight),
        repeatNumber: Number(values.reps),
        exerciseId,
      });
      const response = await getAllLiftingHistoriesForExercise(exerciseId);
      setHistory(sortByDateDesc(response.data));
    } finally {
      setIsSubmittingNewSet(false);
    }
  };

  const handleUpdate = async (id: number, values: { weight: string; reps: string }) => {
    await updateLiftingHistorie(id, {
      weight: Number(values.weight),
      repeatNumber: Number(values.reps),
    });
    const response = await getAllLiftingHistoriesForExercise(exerciseId);
    setHistory(sortByDateDesc(response.data));
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLiftingHistorie(id);
      setHistory((current) => current.filter((entry) => entry.id !== id));
    } catch {
      Alert.alert("Error", "No se pudo eliminar el registro. Intentalo más tarde.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator testID="exercise-detail-loading-indicator" />
      </View>
    );
  }

  if (error || !exercise) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-900">
        <Text className="text-center text-sm text-red-600">{error ?? LOAD_ERROR_MESSAGE}</Text>
      </View>
    );
  }

  return (
    <FlatList
      testID="exercise-history-list"
      data={history}
      keyExtractor={(entry) => String(entry.id)}
      ListHeaderComponent={
        <View className="bg-white px-4 pb-4 pt-4 dark:bg-slate-900">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {exercise.name}
          </Text>
          <Text className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            {exercise.muscle?.name}
          </Text>

          <Text className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
            Registrar set
          </Text>
          <SetForm
            testIDPrefix="log-set"
            submitLabel="Guardar"
            submitting={isSubmittingNewSet}
            onSubmit={handleCreate}
          />

          <Text className="mb-2 mt-6 text-base font-semibold text-slate-900 dark:text-white">
            Historial
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View testID="exercise-history-empty" className="items-center px-6 py-10">
          <Text className="text-center text-sm text-slate-600 dark:text-slate-300">
            Todavía no registraste sets para este ejercicio.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <HistoryListItem entry={item} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    />
  );
};

export default ExerciseDetailScreen;
