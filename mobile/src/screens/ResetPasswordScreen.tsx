import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { resetPasswordRequest } from "@progresapp/shared/api/auth";
import type { RootStackParamList } from "../navigation/RootNavigator";
import {
  mapAuthErrorMessage,
  validateResetPasswordForm,
  type ResetPasswordFormErrors,
} from "./validation";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

/**
 * Lets a user set a new password using the reset token they received by
 * email (`backend` issues a long opaque token via
 * `${FRONTEND_BASE_URL}/app/reset-password?token=...`, mirroring
 * `frontend/src/react/pages/ResetPassword.tsx`).
 *
 * The mobile app has no deep-linking configured yet, so `route.params.token`
 * (pre-filled in a future phase via a `progresapp://reset-password?token=...`
 * link) is optional — the token field is always editable so the user can
 * paste the code manually from the email in the meantime.
 */
export const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const [token, setToken] = useState(route.params?.token ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const validationErrors = validateResetPasswordForm({ token, password, confirmPassword });
    setErrors(validationErrors);
    setSubmitError(null);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(token, password);
      setSuccessMessage("Contraseña actualizada. Ya podés iniciar sesión.");
      navigation.navigate("Login");
    } catch (error) {
      setSubmitError(mapAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6 dark:bg-slate-900">
      <Text className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Restablecer contraseña
      </Text>
      <Text className="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Ingresá el código que recibiste por correo y tu nueva contraseña.
      </Text>

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Código de recuperación
      </Text>
      <TextInput
        testID="reset-password-token-input"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Pegá el código recibido por email"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.token ? (
        <Text className="mb-2 text-sm text-red-600">{errors.token}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Nueva contraseña
      </Text>
      <TextInput
        testID="reset-password-password-input"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        placeholder="••••••••"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.password ? (
        <Text className="mb-2 text-sm text-red-600">{errors.password}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Confirmar contraseña
      </Text>
      <TextInput
        testID="reset-password-confirm-password-input"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        textContentType="newPassword"
        placeholder="••••••••"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.confirmPassword ? (
        <Text className="mb-2 text-sm text-red-600">{errors.confirmPassword}</Text>
      ) : (
        <View className="mb-2" />
      )}

      {submitError ? (
        <Text className="mb-3 text-center text-sm text-red-600">{submitError}</Text>
      ) : null}
      {successMessage ? (
        <Text className="mb-3 text-center text-sm text-green-600">{successMessage}</Text>
      ) : null}

      <Pressable
        testID="reset-password-submit-button"
        onPress={onSubmit}
        disabled={loading}
        className="mb-4 items-center rounded-md bg-blue-600 py-3 disabled:opacity-60"
      >
        <Text className="text-base font-semibold text-white">
          {loading ? "Actualizando..." : "Cambiar contraseña"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text className="text-center text-sm text-blue-600 dark:text-blue-400">
          Volver a iniciar sesión
        </Text>
      </Pressable>
    </View>
  );
};

export default ResetPasswordScreen;
