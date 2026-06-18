/**
 * Pure form-validation and error-mapping helpers for the mobile auth
 * screens (Login, Register, ForgotPassword).
 *
 * Kept dependency-free (no React Native imports) so they can be unit
 * tested with the isolated ts-jest harness (`jest.isolated.config.js`)
 * without going through the `jest-expo` preset.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors the backend's `IsStrongPassword` rule (class-validator default:
 * at least 1 lowercase, 1 uppercase, 1 number, 1 symbol).
 */
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

/**
 * Validates a new-password + confirm-password pair against the shared
 * password rules (required, min length 6, complexity, match). Used by both
 * registration and password-reset forms, which have identical password
 * rules but different surrounding fields.
 */
const validatePasswordPair = (
  password: string,
  confirmPassword: string
): { password?: string; confirmPassword?: string } => {
  const errors: { password?: string; confirmPassword?: string } = {};

  if (!password) {
    errors.password = "La contraseña es requerida";
  } else if (password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  } else if (!STRONG_PASSWORD_REGEX.test(password)) {
    errors.password = "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "La confirmación de contraseña es requerida";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!values.email) {
    errors.email = "El email es requerido";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Email inválido";
  }

  if (!values.password) {
    errors.password = "La contraseña es requerida";
  }

  return errors;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export const validateRegisterForm = (values: RegisterFormValues): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (!values.fullName) {
    errors.fullName = "El nombre es requerido";
  } else if (values.fullName.length < 2) {
    errors.fullName = "El nombre debe tener al menos 2 caracteres";
  }

  if (!values.email) {
    errors.email = "El email es requerido";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Email inválido";
  }

  Object.assign(errors, validatePasswordPair(values.password, values.confirmPassword));

  return errors;
};

export type ResetPasswordFormValues = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = Partial<Record<keyof ResetPasswordFormValues, string>>;

/**
 * Validates the password-strength + confirmation rules shared with
 * registration, plus a required reset token.
 */
export const validateResetPasswordForm = (
  values: ResetPasswordFormValues
): ResetPasswordFormErrors => {
  const errors: ResetPasswordFormErrors = {};

  if (!values.token) {
    errors.token = "El código de recuperación es requerido";
  }

  Object.assign(errors, validatePasswordPair(values.password, values.confirmPassword));

  return errors;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type ForgotPasswordFormErrors = Partial<Record<keyof ForgotPasswordFormValues, string>>;

export const validateForgotPasswordForm = (
  values: ForgotPasswordFormValues
): ForgotPasswordFormErrors => {
  const errors: ForgotPasswordFormErrors = {};

  if (!values.email) {
    errors.email = "El email es requerido";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Email inválido";
  }

  return errors;
};

export type LogSetFormValues = {
  weight: string;
  reps: string;
};

export type LogSetFormErrors = Partial<Record<keyof LogSetFormValues, string>>;

/**
 * At most one decimal place, mirrors the backend's
 * `@IsNumber({ maxDecimalPlaces: 1 })` rule for `weight`
 * (`RequestCreateLiftingHistoryDto`).
 */
const WEIGHT_REGEX = /^\d+(\.\d{1})?$/;

/** Positive integers only, mirrors the backend's `@IsInt() @IsPositive()` rule for `repeatNumber`. */
const INTEGER_REGEX = /^\d+$/;

/**
 * Validates the "log a set" form (mobile-workout-tracking Scenario:
 * Successful log entry / Invalid input). Both `weight` and `reps` arrive as
 * raw `TextInput` strings; numeric/format rules mirror the backend's
 * `RequestCreateLiftingHistoryDto` (`weight`: positive number, max 1
 * decimal; `repeatNumber`: positive integer).
 */
export const validateLogSetForm = (values: LogSetFormValues): LogSetFormErrors => {
  const errors: LogSetFormErrors = {};

  const weight = values.weight.trim();
  const reps = values.reps.trim();

  if (!weight) {
    errors.weight = "El peso es requerido";
  } else if (Number.isNaN(Number(weight))) {
    errors.weight = "El peso debe ser un número";
  } else if (Number(weight) <= 0) {
    errors.weight = "El peso debe ser un número positivo";
  } else if (!WEIGHT_REGEX.test(weight)) {
    errors.weight = "El peso debe tener como máximo un decimal";
  }

  if (!reps) {
    errors.reps = "Las repeticiones son requeridas";
  } else if (Number.isNaN(Number(reps))) {
    errors.reps = "Las repeticiones deben ser un número entero";
  } else if (Number(reps) <= 0) {
    errors.reps = "Las repeticiones deben ser un número positivo";
  } else if (!INTEGER_REGEX.test(reps)) {
    errors.reps = "Las repeticiones deben ser un número entero";
  }

  return errors;
};

const GENERIC_ERROR_MESSAGE = "Ocurrió un error. Por favor, inténtalo de nuevo.";

/**
 * Maps an axios-style error (or any thrown value) from the auth API to a
 * user-facing message in Spanish, mirroring the messages returned by
 * `backend/src/auth/auth.service.ts`:
 * - register: "User already exists" (400)
 * - login: "Invalid password" / "Dont exists user" (400)
 * - forgot-password: ServiceUnavailableException `{ error: 'email_not_sent' }` (503)
 * - reset-password: "Invalid token" / "Token expired" (400)
 */
export const mapAuthErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { status?: number; data?: Record<string, unknown> } })
    ?.response;

  if (!response) {
    return GENERIC_ERROR_MESSAGE;
  }

  const { status, data } = response;
  const message = typeof data?.message === "string" ? data.message : undefined;
  const code = typeof data?.error === "string" ? data.error : undefined;

  if (status === 400 && message === "User already exists") {
    return "Ya existe una cuenta con ese correo electrónico.";
  }

  if (status === 400 && (message === "Invalid password" || message === "Dont exists user")) {
    return "Email o contraseña incorrectos.";
  }

  if (status === 503 && code === "email_not_sent") {
    return "No se pudo enviar el correo. Intentalo más tarde.";
  }

  if (status === 400 && (message === "Invalid token" || message === "Token expired")) {
    return "El código de recuperación es inválido o expiró. Solicitá uno nuevo.";
  }

  return GENERIC_ERROR_MESSAGE;
};
