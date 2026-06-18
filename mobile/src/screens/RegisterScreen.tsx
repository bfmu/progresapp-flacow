import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { registerRequest } from "@progresapp/shared/api/auth";
import type { RootStackParamList } from "../navigation/RootNavigator";
import {
  mapAuthErrorMessage,
  validateRegisterForm,
  type RegisterFormErrors,
} from "./validation";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const validationErrors = validateRegisterForm({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setErrors(validationErrors);
    setSubmitError(null);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await registerRequest(fullName, email, password);
      setSuccessMessage("Registro exitoso. Ahora podés iniciar sesión.");
      navigation.navigate("Login");
    } catch (error) {
      setSubmitError(mapAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6 dark:bg-slate-900">
      <Text className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Crear Cuenta
      </Text>

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Nombre completo
      </Text>
      <TextInput
        testID="register-fullname-input"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Jane Doe"
        className="mb-1 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900 dark:border-slate-600 dark:text-white"
      />
      {errors.fullName ? (
        <Text className="mb-2 text-sm text-red-600">{errors.fullName}</Text>
      ) : (
        <View className="mb-2" />
      )}

      <Text className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Correo electrónico
      </Text>
      <TextInput
        testID="register-email-input"
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
        testID="register-password-input"
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
        testID="register-confirm-password-input"
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
        testID="register-submit-button"
        onPress={onSubmit}
        disabled={loading}
        className="mb-4 items-center rounded-md bg-blue-600 py-3 disabled:opacity-60"
      >
        <Text className="text-base font-semibold text-white">
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text className="text-center text-sm text-slate-700 dark:text-slate-200">
          ¿Ya tienes una cuenta?{" "}
          <Text className="text-blue-600 dark:text-blue-400">Inicia sesión aquí.</Text>
        </Text>
      </Pressable>
    </View>
  );
};

export default RegisterScreen;
