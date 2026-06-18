import {
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
  validateLogSetForm,
  mapAuthErrorMessage,
} from "../validation";

describe("validateLoginForm", () => {
  it("returns no errors for a valid email and non-empty password", () => {
    const errors = validateLoginForm({ email: "user@example.com", password: "secret" });

    expect(errors).toEqual({});
  });

  it("returns an email error when email is empty", () => {
    const errors = validateLoginForm({ email: "", password: "secret" });

    expect(errors.email).toBe("El email es requerido");
  });

  it("returns an email error when email format is invalid", () => {
    const errors = validateLoginForm({ email: "not-an-email", password: "secret" });

    expect(errors.email).toBe("Email inválido");
  });

  it("returns a password error when password is empty", () => {
    const errors = validateLoginForm({ email: "user@example.com", password: "" });

    expect(errors.password).toBe("La contraseña es requerida");
  });

  it("returns both errors when email and password are empty", () => {
    const errors = validateLoginForm({ email: "", password: "" });

    expect(errors.email).toBe("El email es requerido");
    expect(errors.password).toBe("La contraseña es requerida");
  });
});

describe("validateRegisterForm", () => {
  const valid = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
  };

  it("returns no errors for fully valid input", () => {
    expect(validateRegisterForm(valid)).toEqual({});
  });

  it("returns a fullName error when empty", () => {
    const errors = validateRegisterForm({ ...valid, fullName: "" });

    expect(errors.fullName).toBe("El nombre es requerido");
  });

  it("returns a fullName error when shorter than 2 characters", () => {
    const errors = validateRegisterForm({ ...valid, fullName: "A" });

    expect(errors.fullName).toBe("El nombre debe tener al menos 2 caracteres");
  });

  it("returns an email error when empty", () => {
    const errors = validateRegisterForm({ ...valid, email: "" });

    expect(errors.email).toBe("El email es requerido");
  });

  it("returns an email error when format is invalid", () => {
    const errors = validateRegisterForm({ ...valid, email: "not-an-email" });

    expect(errors.email).toBe("Email inválido");
  });

  it("returns a password error when empty", () => {
    const errors = validateRegisterForm({ ...valid, password: "", confirmPassword: "" });

    expect(errors.password).toBe("La contraseña es requerida");
  });

  it("returns a password error when shorter than 6 characters", () => {
    const errors = validateRegisterForm({ ...valid, password: "Ab1!", confirmPassword: "Ab1!" });

    expect(errors.password).toBe("La contraseña debe tener al menos 6 caracteres");
  });

  it("returns a password error when it does not meet complexity rules", () => {
    const errors = validateRegisterForm({
      ...valid,
      password: "alllowercase",
      confirmPassword: "alllowercase",
    });

    expect(errors.password).toBe(
      "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos"
    );
  });

  it("returns a confirmPassword error when passwords do not match", () => {
    const errors = validateRegisterForm({ ...valid, confirmPassword: "Different1!" });

    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden");
  });

  it("returns a confirmPassword error when confirmation is empty", () => {
    const errors = validateRegisterForm({ ...valid, confirmPassword: "" });

    expect(errors.confirmPassword).toBe("La confirmación de contraseña es requerida");
  });

  it("returns multiple errors when several fields are invalid", () => {
    const errors = validateRegisterForm({
      fullName: "",
      email: "bad",
      password: "weak",
      confirmPassword: "other",
    });

    expect(Object.keys(errors).sort()).toEqual(
      ["confirmPassword", "email", "fullName", "password"].sort()
    );
  });

  it("accepts a password exactly at the 6-character boundary when it meets complexity rules", () => {
    const errors = validateRegisterForm({
      ...valid,
      password: "Ab1!cd",
      confirmPassword: "Ab1!cd",
    });

    expect(errors.password).toBeUndefined();
  });

  it("rejects a password that is long enough but missing a symbol", () => {
    const errors = validateRegisterForm({
      ...valid,
      password: "Abcdefg1",
      confirmPassword: "Abcdefg1",
    });

    expect(errors.password).toBe(
      "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos"
    );
  });
});

describe("validateForgotPasswordForm", () => {
  it("returns no errors for a valid email", () => {
    expect(validateForgotPasswordForm({ email: "user@example.com" })).toEqual({});
  });

  it("returns an email error when empty", () => {
    const errors = validateForgotPasswordForm({ email: "" });

    expect(errors.email).toBe("El email es requerido");
  });

  it("returns an email error when format is invalid", () => {
    const errors = validateForgotPasswordForm({ email: "not-an-email" });

    expect(errors.email).toBe("Email inválido");
  });
});

describe("validateResetPasswordForm", () => {
  const valid = {
    token: "reset-token-123",
    password: "Str0ng!Pass",
    confirmPassword: "Str0ng!Pass",
  };

  it("returns no errors for fully valid input", () => {
    expect(validateResetPasswordForm(valid)).toEqual({});
  });

  it("returns a token error when empty", () => {
    const errors = validateResetPasswordForm({ ...valid, token: "" });

    expect(errors.token).toBe("El código de recuperación es requerido");
  });

  it("returns a password error when empty", () => {
    const errors = validateResetPasswordForm({ ...valid, password: "", confirmPassword: "" });

    expect(errors.password).toBe("La contraseña es requerida");
  });

  it("returns a password error when shorter than 6 characters", () => {
    const errors = validateResetPasswordForm({
      ...valid,
      password: "Ab1!",
      confirmPassword: "Ab1!",
    });

    expect(errors.password).toBe("La contraseña debe tener al menos 6 caracteres");
  });

  it("returns a password error when it does not meet complexity rules", () => {
    const errors = validateResetPasswordForm({
      ...valid,
      password: "alllowercase",
      confirmPassword: "alllowercase",
    });

    expect(errors.password).toBe(
      "La contraseña debe incluir mayúsculas, minúsculas, números y símbolos"
    );
  });

  it("returns a confirmPassword error when passwords do not match", () => {
    const errors = validateResetPasswordForm({ ...valid, confirmPassword: "Different1!" });

    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden");
  });

  it("returns a confirmPassword error when confirmation is empty", () => {
    const errors = validateResetPasswordForm({ ...valid, confirmPassword: "" });

    expect(errors.confirmPassword).toBe("La confirmación de contraseña es requerida");
  });

  it("returns multiple errors when several fields are invalid", () => {
    const errors = validateResetPasswordForm({ token: "", password: "weak", confirmPassword: "other" });

    expect(Object.keys(errors).sort()).toEqual(["confirmPassword", "password", "token"].sort());
  });

  it("accepts a password exactly at the 6-character boundary when it meets complexity rules", () => {
    const errors = validateResetPasswordForm({
      ...valid,
      password: "Ab1!cd",
      confirmPassword: "Ab1!cd",
    });

    expect(errors.password).toBeUndefined();
  });
});

describe("mapAuthErrorMessage", () => {
  it("maps a 400 'User already exists' response to a duplicate-email message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 400, data: { message: "User already exists" } },
    });

    expect(message).toBe("Ya existe una cuenta con ese correo electrónico.");
  });

  it("maps a 400 'Invalid password' response to an invalid-credentials message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 400, data: { message: "Invalid password" } },
    });

    expect(message).toBe("Email o contraseña incorrectos.");
  });

  it("maps a 400 'Dont exists user' response to an invalid-credentials message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 400, data: { message: "Dont exists user" } },
    });

    expect(message).toBe("Email o contraseña incorrectos.");
  });

  it("maps a 503 email_not_sent response to a service-unavailable message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 503, data: { error: "email_not_sent" } },
    });

    expect(message).toBe("No se pudo enviar el correo. Intentalo más tarde.");
  });

  it("maps a 400 'Invalid token' response to an expired/invalid token message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 400, data: { message: "Invalid token" } },
    });

    expect(message).toBe("El código de recuperación es inválido o expiró. Solicitá uno nuevo.");
  });

  it("maps a 400 'Token expired' response to an expired/invalid token message", () => {
    const message = mapAuthErrorMessage({
      response: { status: 400, data: { message: "Token expired" } },
    });

    expect(message).toBe("El código de recuperación es inválido o expiró. Solicitá uno nuevo.");
  });

  it("falls back to a generic message for unknown errors", () => {
    const message = mapAuthErrorMessage({ response: { status: 500, data: {} } });

    expect(message).toBe("Ocurrió un error. Por favor, inténtalo de nuevo.");
  });

  it("falls back to a generic message when there is no response (network error)", () => {
    const message = mapAuthErrorMessage(new Error("Network Error"));

    expect(message).toBe("Ocurrió un error. Por favor, inténtalo de nuevo.");
  });

  it("falls back to a generic message when the response has no data", () => {
    const message = mapAuthErrorMessage({ response: { status: 400 } });

    expect(message).toBe("Ocurrió un error. Por favor, inténtalo de nuevo.");
  });
});

describe("validateLogSetForm", () => {
  it("returns no errors for a valid positive integer weight and reps", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "10" });

    expect(errors).toEqual({});
  });

  it("returns no errors for a weight with one decimal place", () => {
    const errors = validateLogSetForm({ weight: "62.5", reps: "8" });

    expect(errors).toEqual({});
  });

  it("returns a weight error when weight is empty", () => {
    const errors = validateLogSetForm({ weight: "", reps: "10" });

    expect(errors.weight).toBe("El peso es requerido");
  });

  it("returns a reps error when reps is empty", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "" });

    expect(errors.reps).toBe("Las repeticiones son requeridas");
  });

  it("returns errors for both fields when both are empty", () => {
    const errors = validateLogSetForm({ weight: "", reps: "" });

    expect(errors.weight).toBe("El peso es requerido");
    expect(errors.reps).toBe("Las repeticiones son requeridas");
  });

  it("returns a weight error when weight is non-numeric", () => {
    const errors = validateLogSetForm({ weight: "abc", reps: "10" });

    expect(errors.weight).toBe("El peso debe ser un número");
  });

  it("returns a reps error when reps is non-numeric", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "abc" });

    expect(errors.reps).toBe("Las repeticiones deben ser un número entero");
  });

  it("returns a weight error when weight is zero", () => {
    const errors = validateLogSetForm({ weight: "0", reps: "10" });

    expect(errors.weight).toBe("El peso debe ser un número positivo");
  });

  it("returns a weight error when weight is negative", () => {
    const errors = validateLogSetForm({ weight: "-5", reps: "10" });

    expect(errors.weight).toBe("El peso debe ser un número positivo");
  });

  it("returns a reps error when reps is zero", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "0" });

    expect(errors.reps).toBe("Las repeticiones deben ser un número positivo");
  });

  it("returns a reps error when reps is negative", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "-1" });

    expect(errors.reps).toBe("Las repeticiones deben ser un número positivo");
  });

  it("returns a reps error when reps is a decimal", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "10.5" });

    expect(errors.reps).toBe("Las repeticiones deben ser un número entero");
  });

  it("returns a weight error when weight has more than one decimal place", () => {
    const errors = validateLogSetForm({ weight: "60.55", reps: "10" });

    expect(errors.weight).toBe("El peso debe tener como máximo un decimal");
  });

  it("returns a weight error when weight is only whitespace", () => {
    const errors = validateLogSetForm({ weight: "   ", reps: "10" });

    expect(errors.weight).toBe("El peso es requerido");
  });

  it("returns a reps error when reps is only whitespace", () => {
    const errors = validateLogSetForm({ weight: "60", reps: "   " });

    expect(errors.reps).toBe("Las repeticiones son requeridas");
  });
});
