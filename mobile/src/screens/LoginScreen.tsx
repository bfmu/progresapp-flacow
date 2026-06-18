import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loginRequest } from "@progresapp/shared/api/auth";
import { userInfoRequest } from "@progresapp/shared/api/users";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useAuthStore } from "../lib/auth-store";
import { mapAuthErrorMessage, validateLoginForm, type LoginFormErrors } from "./validation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);
  const setProfile = useAuthStore((state) => state.setProfile);

  const onSubmit = async () => {
    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await loginRequest(email, password);
      setToken(res.data.accessToken);

      const profile = await userInfoRequest();
      setProfile(profile);
      // Navigation to Home happens automatically: App.tsx subscribes to
      // useAuthStore and swaps RootNavigator's stack once `isAuth` is true.
    } catch (error) {
      setSubmitError(mapAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6 dark:bg-slate-900">
      <Text className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Identifícate
      </Text>

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Correo electrónico
      </Text>
      <TextInput
        testID="login-email-input"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="tu@email.com"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.email ? (
        <Text className="mb-2 text-sm text-red-600">{errors.email}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Contraseña
      </Text>
      <TextInput
        testID="login-password-input"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        placeholder="••••••••"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.password ? (
        <Text className="mb-2 text-sm text-red-600">{errors.password}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Pressable onPress={() => navigation.navigate("ForgotPassword")} className="mb-4">
        <Text className="text-right text-sm text-blue-600 dark:text-blue-400">
          ¿Olvidaste tu contraseña?
        </Text>
      </Pressable>

      {submitError ? (
        <Text className="mb-3 text-center text-sm text-red-600">{submitError}</Text>
      ) : null}

      <Pressable
        testID="login-submit-button"
        onPress={onSubmit}
        disabled={loading}
        className="mb-4 items-center rounded-md bg-blue-600 py-3 disabled:opacity-60"
      >
        <Text className="text-base font-semibold text-white">
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text className="text-center text-sm text-slate-700 dark:text-slate-200">
          ¿No tienes una cuenta?{" "}
          <Text className="text-blue-600 dark:text-blue-400">Regístrate aquí.</Text>
        </Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;
