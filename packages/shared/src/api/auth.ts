import apiClient from "./client";

export const loginRequest = async (email: string, password: string) => {
  return await apiClient.post("/auth/login", { email, password });
};

export const registerRequest = async (
  full_name: string,
  email: string,
  password: string
) => {
  return await apiClient.post("/auth/register", {
    full_name,
    email,
    password,
  });  
};

export const passwordResetRequest = async (email: string) => {
  return await apiClient.post("/auth/forgot-password", {email});
}

export const resetPasswordRequest = async (token: string, password: string) => {
  return await apiClient.post("/auth/reset-password", {token, password});
}

export const googleIdTokenRequest = async (idToken: string): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<{ accessToken: string }>('/auth/google/id-token', { idToken });
  return response.data;
};
