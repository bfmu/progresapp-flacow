import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

/**
 * Authenticated landing screen. Logout lives in the header (wired in
 * `RootNavigator`'s `Home` screen options, Phase 5). Phase 6 adds the entry
 * point into workout tracking (exercise list + history).
 */
export const HomeScreen = ({ navigation }: Props) => (
  <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-900">
    <Text className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Home</Text>

    <Pressable
      testID="home-exercises-button"
      onPress={() => navigation.navigate("ExerciseList")}
      className="mb-4 w-full items-center rounded-md bg-blue-600 py-3"
    >
      <Text className="text-base font-semibold text-white">Ver ejercicios</Text>
    </Pressable>

    <Pressable
      testID="home-rest-timer-button"
      onPress={() => navigation.navigate("RestTimer")}
      className="w-full items-center rounded-md bg-emerald-600 py-3"
    >
      <Text className="text-base font-semibold text-white">Temporizador de descanso</Text>
    </Pressable>
  </View>
);

export default HomeScreen;
