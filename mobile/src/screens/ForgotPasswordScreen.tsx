import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { passwordResetRequest } from "@progresapp/shared/api/auth";
import type { RootStackParamList } from "../navigation/RootNavigator";
import {
  mapAuthErrorMessage,
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
} from "./validation";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const validationErrors = validateForgotPasswordForm({ email });
    setErrors(validationErrors);
    setSubmitError(null);
    setConfirmationMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await passwordResetRequest(email);
      // Per spec (no account enumeration), show the same confirmation
      // regardless of whether the email exists.
      setConfirmationMessage("Si el email existe, recibirás un enlace de recuperación.");
    } catch (error) {
      setSubmitError(mapAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6 dark:bg-slate-900">
      <Text className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Recuperar contraseña
      </Text>
      <Text className="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </Text>

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Correo electrónico
      </Text>
      <TextInput
        testID="forgot-password-email-input"
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

      {submitError ? (
        <Text className="mb-3 text-center text-sm text-red-600">{submitError}</Text>
      ) : null}
      {confirmationMessage ? (
        <Text className="mb-3 text-center text-sm text-green-600">{confirmationMessage}</Text>
      ) : null}

      <Pressable
        testID="forgot-password-submit-button"
        onPress={onSubmit}
        disabled={loading}
        className="mb-4 items-center rounded-md bg-blue-600 py-3 disabled:opacity-60"
      >
        <Text className="text-base font-semibold text-white">
          {loading ? "Enviando..." : "Enviar enlace"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text className="text-center text-sm text-blue-600 dark:text-blue-400">
          Volver a iniciar sesión
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("ResetPassword", { token: undefined })}>
        <Text className="mt-3 text-center text-sm text-blue-600 dark:text-blue-400">
          Ya tengo un código de recuperación
        </Text>
      </Pressable>
    </View>
  );
};

export default ForgotPasswordScreen;
