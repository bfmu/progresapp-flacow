import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ExerciseListScreen } from "../screens/ExerciseListScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { RestTimerScreen } from "../screens/RestTimerScreen";
import { useAuthStore } from "../lib/auth-store";

/**
 * Root navigation param list, shared across the auth and app stacks.
 *
 * Auth screens (Login, Register, ForgotPassword, ResetPassword) landed in
 * Phase 5. Workout tracking (ExerciseList, ExerciseDetail) landed in
 * Phase 6, replacing the original `Workout: { workoutId }` placeholder.
 *
 * `ResetPassword.token` is optional: it can be pre-filled via a future deep
 * link (`progresapp://reset-password?token=...`, not yet implemented), or
 * left empty for the user to paste the code they received by email.
 */
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  Home: undefined;
  ExerciseList: undefined;
  ExerciseDetail: { exerciseId: number };
  RestTimer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Logout button rendered in the Home screen header. Calling `logout()`
 * clears the persisted session (SecureStore via the auth store's `persist`
 * middleware); the resulting `isAuth: false` is picked up by `App.tsx`'s
 * subscription, which swaps the navigator back to the auth stack — no
 * imperative `navigation.navigate("Login")` needed here.
 */
const HeaderLogoutButton = () => (
  <Pressable testID="logout-button" onPress={() => useAuthStore.getState().logout()}>
    <Text className="text-base font-medium text-blue-600 dark:text-blue-400">Salir</Text>
  </Pressable>
);

export type RootNavigatorProps = {
  /** Whether the user has a valid session. Controls the initial route. */
  isAuthenticated: boolean;
};

/**
 * Top-level stack navigator. `isAuthenticated` decides whether the user
 * lands on the auth stack (Login/Register/ForgotPassword) or the app stack
 * (Home/ExerciseList/ExerciseDetail). Auth state changes (login/logout) are
 * expected to remount this navigator via the `isAuthenticated` prop
 * changing.
 *
 * `NavigationContainer` and `SafeAreaProvider` are provided by the host
 * app (`App.tsx`), not here, so this component stays test-friendly and
 * composable.
 */
export const RootNavigator = ({ isAuthenticated }: RootNavigatorProps) => (
  <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
    {isAuthenticated ? (
      <>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerRight: () => <HeaderLogoutButton /> }}
        />
        <Stack.Screen
          name="ExerciseList"
          component={ExerciseListScreen}
          options={{ title: "Ejercicios" }}
        />
        <Stack.Screen
          name="ExerciseDetail"
          component={ExerciseDetailScreen}
          options={{ title: "Detalle del ejercicio" }}
        />
        <Stack.Screen
          name="RestTimer"
          component={RestTimerScreen}
          options={{ title: "Temporizador de descanso" }}
        />
      </>
    ) : (
      <>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
          initialParams={{ token: undefined }}
        />
      </>
    )}
  </Stack.Navigator>
);

export default RootNavigator;
